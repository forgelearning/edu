-- Keep every existing student and response ID. A code can restore an already
-- claimed class row without asking for the student's name again.
create or replace function public.join_class_with_student_code(
  p_class_code text, p_student_code text, p_name text
)
returns setof json language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_class public.classes%rowtype;
  v_access public.student_access_codes%rowtype;
  v_student public.students%rowtype;
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_code text := regexp_replace(upper(btrim(coalesce(p_student_code, ''))), '[^A-Z0-9]', '', 'g');
begin
  if length(v_code) < 8 then return; end if;
  select * into v_class from public.classes
    where upper(code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if not found then return; end if;
  select * into v_access from public.student_access_codes
    where class_id = v_class.id and active
      and code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
    for update;
  if not found then return; end if;

  if v_access.student_id is null then
    if length(v_name) < 1 then
      return query select json_build_object('needs_name', true);
      return;
    end if;
    insert into public.students(name, class_id, auth_user_id)
      values(v_name, v_class.id, auth.uid()) returning * into v_student;
    update public.student_access_codes
      set student_id = v_student.id, claimed_at = now() where id = v_access.id;
  else
    select * into v_student from public.students where id = v_access.student_id;
    if not found or v_student.class_id is distinct from v_class.id then return; end if;
    -- A code is sufficient to use its class row, but it cannot transfer a row
    -- already linked to another email account.
    if auth.uid() is not null and v_student.auth_user_id is null then
      update public.students set auth_user_id = auth.uid()
        where id = v_student.id returning * into v_student;
    end if;
  end if;

  return query select json_build_object(
    'student_id', v_student.id::text, 'student_name', v_student.name,
    'class_id', v_class.id::text, 'class_name', v_class.name,
    'class_code', v_class.code, 'subject', v_class.subject,
    'extra_time', v_student.extra_time,
    'linked_to_account', auth.uid() is not null and v_student.auth_user_id = auth.uid()
  );
end;
$$;
revoke all on function public.join_class_with_student_code(text,text,text) from public;
grant execute on function public.join_class_with_student_code(text,text,text) to anon, authenticated;

-- Email account restoration returns only rows owned by the caller. Class and
-- response rows remain separate from free practice and from other classes.
create or replace function public.get_my_class_students()
returns setof json language sql security definer
set search_path = public, pg_temp as $$
  select json_build_object(
    'student_id', s.id::text, 'student_name', s.name,
    'class_id', c.id::text, 'class_name', c.name,
    'class_code', c.code, 'subject', c.subject
  )
  from public.students s join public.classes c on c.id = s.class_id
  where auth.uid() is not null and s.auth_user_id = auth.uid()
  order by s.created_at desc;
$$;
revoke all on function public.get_my_class_students() from public, anon;
grant execute on function public.get_my_class_students() to authenticated;

create policy "Class account reads its own student rows"
  on public.students for select to authenticated
  using (class_id is not null and auth_user_id = (select auth.uid()));
create policy "Class account reads its own responses"
  on public.responses for select to authenticated
  using (exists (
    select 1 from public.students s
    where s.id = student_id and s.class_id is not null
      and s.auth_user_id = (select auth.uid())
  ));

-- Account ownership can replace the student code for response reads/writes.
-- Guest students continue using both codes exactly as before.
create or replace function public.get_student_own_responses_with_code(
  p_student_id text, p_class_code text, p_student_code text
)
returns setof json language sql security definer
set search_path = public, pg_temp as $$
  select to_json(r) from public.responses r
  where r.student_id::text = p_student_id
    and exists (
      select 1 from public.students s join public.classes c on c.id = s.class_id
      where s.id = r.student_id and upper(c.code) = upper(btrim(coalesce(p_class_code, '')))
        and ((auth.uid() is not null and s.auth_user_id = auth.uid())
          or exists (
            select 1 from public.student_access_codes ac
            where ac.student_id = s.id and ac.class_id = c.id and ac.active
              and ac.code_hash = encode(extensions.digest(convert_to(
                regexp_replace(upper(btrim(coalesce(p_student_code, ''))), '[^A-Z0-9]', '', 'g'),
                'UTF8'), 'sha256'::text), 'hex')
          ))
    )
  order by r.created_at desc;
$$;
revoke all on function public.get_student_own_responses_with_code(text,text,text) from public;
grant execute on function public.get_student_own_responses_with_code(text,text,text) to anon, authenticated;

create or replace function public.record_student_response_with_code(
  p_student_id text, p_class_code text, p_student_code text,
  p_question_id text, p_bank text, p_subject text, p_selected_option text,
  p_is_correct boolean, p_misconception_tag text, p_spec_point text,
  p_reforge_attempted boolean, p_reforge_correct boolean,
  p_assignment_id uuid, p_hint_used boolean
)
returns jsonb language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_class_id uuid;
  v_response_id uuid;
  v_code text := regexp_replace(upper(btrim(coalesce(p_student_code, ''))), '[^A-Z0-9]', '', 'g');
begin
  select c.id into v_class_id from public.classes c
    where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if v_class_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if not exists (
    select 1 from public.students s where s.id::text = btrim(coalesce(p_student_id, ''))
      and s.class_id = v_class_id
      and ((auth.uid() is not null and s.auth_user_id = auth.uid())
        or (length(v_code) >= 8 and exists (
          select 1 from public.student_access_codes ac
          where ac.student_id = s.id and ac.class_id = v_class_id and ac.active
            and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
        )))
  ) then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if p_assignment_id is not null and not exists (
    select 1 from public.assignments a where a.id = p_assignment_id and a.class_id = v_class_id
  ) then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_assignment');
  end if;
  insert into public.responses(
    student_id,class_id,question_id,bank,subject,selected_option,is_correct,
    misconception_tag,spec_point,reforge_attempted,reforge_correct,assignment_id,hint_used
  ) values (
    p_student_id::uuid,v_class_id,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,
    p_misconception_tag,p_spec_point,coalesce(p_reforge_attempted,false),p_reforge_correct,
    p_assignment_id,coalesce(p_hint_used,false)
  ) returning id into v_response_id;
  return jsonb_build_object('allowed', true, 'id', v_response_id);
end;
$$;
revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid,boolean) to anon, authenticated;

create or replace function public.record_revision_review_with_code(
  p_student_id text, p_class_code text, p_student_code text,
  p_card_key text, p_bank text, p_rating text, p_due_at timestamptz,
  p_assignment_id uuid default null
)
returns json language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_class_id uuid;
  v_student_id uuid;
  v_code text := regexp_replace(upper(btrim(coalesce(p_student_code, ''))), '[^A-Z0-9]', '', 'g');
  v_assignment_class uuid;
  v_id uuid;
begin
  if p_rating not in ('again', 'nearly', 'got-it') then raise exception 'invalid_revision_rating'; end if;
  if length(btrim(coalesce(p_card_key, ''))) < 3 or length(btrim(coalesce(p_bank, ''))) < 1 then
    raise exception 'invalid_revision_card';
  end if;
  select c.id into v_class_id from public.classes c
    where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if v_class_id is null then raise exception 'invalid_class'; end if;
  select s.id into v_student_id from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) and s.class_id = v_class_id
    and ((auth.uid() is not null and s.auth_user_id = auth.uid())
      or (length(v_code) >= 8 and exists (
        select 1 from public.student_access_codes ac
        where ac.student_id = s.id and ac.class_id = v_class_id and ac.active
          and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
      ))) limit 1;
  if v_student_id is null then raise exception 'invalid_student_session'; end if;
  if p_assignment_id is not null then
    select a.class_id into v_assignment_class from public.assignments a where a.id = p_assignment_id;
    if v_assignment_class is distinct from v_class_id then raise exception 'invalid_assignment'; end if;
  end if;
  insert into public.revision_reviews(student_id, class_id, assignment_id, card_key, bank, rating, due_at)
  values (v_student_id, v_class_id, p_assignment_id, left(btrim(p_card_key), 180),
    left(btrim(p_bank), 120), p_rating, p_due_at) returning id into v_id;
  return json_build_object('allowed', true, 'id', v_id);
end;
$$;
revoke all on function public.record_revision_review_with_code(text,text,text,text,text,text,timestamptz,uuid) from public;
grant execute on function public.record_revision_review_with_code(text,text,text,text,text,text,timestamptz,uuid) to anon, authenticated;
