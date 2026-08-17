-- Carry assignment identity through the anonymous response RPCs.
-- The previous migration added the column, but clients had no way to populate
-- it, so scoring still depended on bank + creation-time inference.

create or replace function public.record_student_response_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text,
  p_spec_point text,
  p_reforge_attempted boolean,
  p_reforge_correct boolean,
  p_assignment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_response_id uuid;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
begin
  select c.id into v_class_id from public.classes c
  where upper(c.code)=upper(btrim(coalesce(p_class_code,''))) limit 1;
  if v_class_id is null or length(v_code)<8 then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  if not exists (
    select 1 from public.students s join public.student_access_codes ac on ac.student_id=s.id
    where s.id::text=btrim(coalesce(p_student_id,'')) and s.class_id=v_class_id
      and ac.class_id=v_class_id and ac.active
      and ac.code_hash=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
  ) then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  if p_assignment_id is not null and not exists (
    select 1 from public.assignments a
    where a.id=p_assignment_id and a.class_id=v_class_id
  ) then
    return jsonb_build_object('allowed',false,'reason','invalid_assignment');
  end if;
  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,spec_point,reforge_attempted,reforge_correct,assignment_id)
  values(p_student_id::uuid,v_class_id,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,p_spec_point,coalesce(p_reforge_attempted,false),p_reforge_correct,p_assignment_id)
  returning id into v_response_id;
  return jsonb_build_object('allowed',true,'id',v_response_id);
end;
$$;

-- Keep the old signature working for pre-deployment clients; it deliberately
-- records a null assignment id and remains subject to the same validation.
create or replace function public.record_student_response_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text default null,
  p_spec_point text default null,
  p_reforge_attempted boolean default false,
  p_reforge_correct boolean default null
)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select public.record_student_response_with_code(
    p_student_id,p_class_code,p_student_code,p_question_id,p_bank,p_subject,
    p_selected_option,p_is_correct,p_misconception_tag,p_spec_point,
    p_reforge_attempted,p_reforge_correct,null::uuid
  );
$$;

revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid) to anon, authenticated;
revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean) to anon, authenticated;

create or replace function public.record_free_response(
  p_student_id text,
  p_free_token text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text,
  p_reforge_attempted boolean,
  p_reforge_correct boolean,
  p_assignment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  used_count integer;
  inserted_id uuid;
begin
  if p_student_id is null or p_free_token is null or length(btrim(p_free_token)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if p_assignment_id is not null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_assignment');
  end if;
  if not exists (select 1 from public.students s where s.id::text=p_student_id and s.free_token=p_free_token and s.class_id is null) then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  select count(*) into used_count from public.responses r
  where r.student_id::text=p_student_id and r.class_id is null
    and coalesce(r.reforge_attempted,false)=false and r.created_at >= date_trunc('day',now());
  if used_count >= 10 and not coalesce(p_reforge_attempted,false) then
    return jsonb_build_object('allowed',false,'reason','daily_limit','used',used_count);
  end if;
  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,reforge_attempted,reforge_correct,assignment_id)
  values(p_student_id::uuid,null,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,coalesce(p_reforge_attempted,false),p_reforge_correct,null)
  returning id into inserted_id;
  return jsonb_build_object('allowed',true,'id',inserted_id,'used',used_count+1);
end;
$function$;

create or replace function public.record_free_response(
  p_student_id text,
  p_free_token text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text default null,
  p_reforge_attempted boolean default false,
  p_reforge_correct boolean default null
)
returns jsonb
language sql
security definer
set search_path to 'public', 'pg_temp'
as $$
  select public.record_free_response(
    p_student_id,p_free_token,p_question_id,p_bank,p_subject,p_selected_option,
    p_is_correct,p_misconception_tag,p_reforge_attempted,p_reforge_correct,null::uuid
  );
$$;

revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid) to anon, authenticated;
revoke execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean) to anon, authenticated;
