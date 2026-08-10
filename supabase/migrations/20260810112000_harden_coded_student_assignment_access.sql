-- Coded classes must require the matching per-student credential. The name
-- fallback is retained only for legacy classes that have never issued codes.

create or replace function public.get_student_assignments(
  p_student_id text,
  p_class_code text,
  p_student_code text default null,
  p_name text default null
)
returns setof json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_has_codes boolean;
begin
  select c.id into v_class_id
  from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, '')))
  limit 1;
  if v_class_id is null then return; end if;

  select s.* into v_student
  from public.students s
  where s.id::text = btrim(coalesce(p_student_id, ''))
    and s.class_id = v_class_id
  limit 1;
  if not found then return; end if;

  select exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = v_class_id and ac.active
  ) into v_has_codes;

  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null;
  elsif length(v_code) >= 8 and exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = v_class_id
      and ac.student_id = v_student.id
      and ac.active
      and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  ) then
    null;
  elsif not v_has_codes and length(v_name) > 0 and lower(v_student.name) = lower(v_name) then
    null;
  else
    return;
  end if;

  return query
  select to_json(a) from public.assignments a
  where a.class_id = v_class_id
  order by a.due_date asc, a.created_at asc;
end;
$$;

-- Restore the documented 10-character student credential format and reject
-- the old four-character format at the join boundary.
create or replace function public.generate_student_access_codes(
  p_class_id uuid,
  p_quantity integer default 25
)
returns table(student_code text, class_code text, class_name text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_code text;
  v_hash text;
  v_i integer;
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 200 then
    raise exception 'quantity_must_be_between_1_and_200';
  end if;
  select * into v_class from public.classes
  where id = p_class_id and teacher_user_id = auth.uid();
  if not found then raise exception 'class_not_owned'; end if;

  for v_i in 1..p_quantity loop
    loop
      v_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));
      v_hash := encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex');
      exit when not exists (select 1 from public.student_access_codes where code_hash = v_hash);
    end loop;
    insert into public.student_access_codes (class_id, code_hash) values (v_class.id, v_hash);
    student_code := v_code; class_code := v_class.code; class_name := v_class.name;
    return next;
  end loop;
end;
$$;

create or replace function public.join_class_with_student_code(
  p_class_code text, p_student_code text, p_name text
)
returns setof json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_access public.student_access_codes%rowtype;
  v_student_id uuid;
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
begin
  if length(v_name) < 1 or length(v_code) < 8 then return; end if;
  select * into v_class from public.classes where upper(code)=upper(btrim(p_class_code)) limit 1;
  if not found then return; end if;
  select * into v_access from public.student_access_codes
  where class_id=v_class.id and active
    and code_hash=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
  for update;
  if not found then return; end if;
  if v_access.student_id is null then
    insert into public.students (name,class_id) values (v_name,v_class.id) returning id into v_student_id;
    update public.student_access_codes set student_id=v_student_id,claimed_at=now() where id=v_access.id;
  else v_student_id:=v_access.student_id;
  end if;
  return query select to_json(row) from (
    select v_student_id::text as student_id,v_class.id::text as class_id,v_class.name as class_name,
           v_class.subject as subject,(select extra_time from public.students where id=v_student_id) as extra_time
  ) row;
end;
$$;

revoke all on function public.generate_student_access_codes(uuid, integer) from public, anon;
grant execute on function public.generate_student_access_codes(uuid, integer) to authenticated;
revoke all on function public.join_class_with_student_code(text, text, text) from public;
grant execute on function public.join_class_with_student_code(text, text, text) to anon, authenticated;
