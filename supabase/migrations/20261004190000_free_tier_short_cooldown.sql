-- Free tier: replace "10 questions per calendar day" with short rounds.
--
-- A free student gets 10 questions, then a 30-minute cooldown, then another
-- 10. The old rule made a student who finished their ten at 9am wait until
-- midnight. Reforge answers stay exempt, as before.
--
-- A round counts questions since the later of (a) the end of the student's
-- last cooldown and (b) one hour ago, so a student who drifts away mid-round
-- comes back to a fresh ten rather than a half-spent one.
--
-- The cooldown end is stored on the student row rather than derived from
-- response timestamps: a derived rolling window refills one question at a
-- time, so the countdown would reach zero and buy a single question.
--
-- The row is locked for the check-and-insert, so two tabs answering at once
-- cannot both slip a question in past the tenth.

alter table public.students
  add column if not exists free_cooldown_until timestamptz;

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
  p_assignment_id uuid,
  p_hint_used boolean
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  c_round_size constant integer := 10;
  c_cooldown constant interval := interval '30 minutes';
  c_idle_reset constant interval := interval '1 hour';
  v_reforge boolean := coalesce(p_reforge_attempted, false);
  v_cooldown_until timestamptz;
  used_count integer := 0;
  inserted_id uuid;
begin
  if p_student_id is null or p_free_token is null or length(btrim(p_free_token)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if p_assignment_id is not null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_assignment');
  end if;

  select s.free_cooldown_until into v_cooldown_until
  from public.students s
  where s.id::text = p_student_id and s.free_token = p_free_token and s.class_id is null
  for update;
  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;

  if not v_reforge then
    if v_cooldown_until > now() then
      return jsonb_build_object('allowed', false, 'reason', 'cooldown',
        'retry_at', v_cooldown_until, 'limit', c_round_size);
    end if;

    select count(*) into used_count from public.responses r
    where r.student_id::text = p_student_id and r.class_id is null
      and coalesce(r.reforge_attempted, false) = false
      and r.created_at >= greatest(coalesce(v_cooldown_until, '-infinity'::timestamptz), now() - c_idle_reset);

    -- Only reachable if a round was already full when this migration landed.
    if used_count >= c_round_size then
      v_cooldown_until := now() + c_cooldown;
      update public.students set free_cooldown_until = v_cooldown_until where id::text = p_student_id;
      return jsonb_build_object('allowed', false, 'reason', 'cooldown',
        'retry_at', v_cooldown_until, 'limit', c_round_size);
    end if;
  end if;

  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,reforge_attempted,reforge_correct,assignment_id,hint_used)
  values(p_student_id::uuid,null,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,v_reforge,p_reforge_correct,null,coalesce(p_hint_used,false))
  returning id into inserted_id;

  if not v_reforge then
    used_count := used_count + 1;
    if used_count >= c_round_size then
      v_cooldown_until := now() + c_cooldown;
      update public.students set free_cooldown_until = v_cooldown_until where id::text = p_student_id;
      return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count,
        'limit', c_round_size, 'cooldown_until', v_cooldown_until);
    end if;
  end if;

  return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count, 'limit', c_round_size);
end;
$function$;

revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) to anon, authenticated;
