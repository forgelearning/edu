-- Enforce the free question allowance at the data boundary.
-- The browser counter remains a UX meter, but is not an authority.

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
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  used_count integer;
  inserted_id uuid;
begin
  if p_student_id is null or p_free_token is null
     or length(btrim(p_free_token)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;

  if not exists (
    select 1 from public.students s
    where s.id::text = p_student_id
      and s.free_token = p_free_token
      and s.class_id is null
  ) then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;

  select count(*) into used_count
  from public.responses r
  where r.student_id::text = p_student_id
    and r.class_id is null
    and coalesce(r.reforge_attempted, false) = false
    and r.created_at >= date_trunc('day', now());

  if used_count >= 10 and not coalesce(p_reforge_attempted, false) then
    return jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'used', used_count);
  end if;

  insert into public.responses (
    student_id, class_id, question_id, bank, subject, selected_option,
    is_correct, misconception_tag, reforge_attempted, reforge_correct
  ) values (
    p_student_id::uuid, null, p_question_id, p_bank, p_subject, p_selected_option,
    p_is_correct, p_misconception_tag, coalesce(p_reforge_attempted, false), p_reforge_correct
  ) returning id into inserted_id;

  return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count + 1);
end;
$function$;

revoke execute on function public.record_free_response(text, text, text, text, text, text, boolean, text, boolean, boolean) from public;
grant execute on function public.record_free_response(text, text, text, text, text, text, boolean, text, boolean, boolean) to anon;
grant execute on function public.record_free_response(text, text, text, text, text, text, boolean, text, boolean, boolean) to authenticated;
