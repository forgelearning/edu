-- Free tier: cap the day at 40 questions, on top of the 10-question rounds.
--
-- Rounds alone (20261004190000) let a free student answer roughly 10 every
-- 40 minutes all day. The cap keeps a reason to subscribe. The day is the
-- UK day (Europe/London), so it resets at UK midnight across BST changes.
--
-- Reaching the cap sets free_cooldown_until to the next midnight, so the
-- existing cooldown check refuses further answers with no extra state. Every
-- refusal and the answer that hits the cap carry `daily_cap: true` so the
-- client can say "come back tomorrow" rather than "30-minute break".
-- Reforge answers stay exempt from both limits.

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
  c_daily_cap constant integer := 40;
  c_cooldown constant interval := interval '30 minutes';
  c_idle_reset constant interval := interval '1 hour';
  v_reforge boolean := coalesce(p_reforge_attempted, false);
  v_local_day timestamp := date_trunc('day', now() at time zone 'Europe/London');
  v_day_start timestamptz := v_local_day at time zone 'Europe/London';
  v_next_midnight timestamptz := (v_local_day + interval '1 day') at time zone 'Europe/London';
  v_cooldown_until timestamptz;
  used_count integer := 0;
  day_count integer := 0;
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
    select count(*) into day_count from public.responses r
    where r.student_id::text = p_student_id and r.class_id is null
      and coalesce(r.reforge_attempted, false) = false
      and r.created_at >= v_day_start;

    if v_cooldown_until > now() then
      return jsonb_build_object('allowed', false, 'reason', 'cooldown',
        'retry_at', v_cooldown_until, 'limit', c_round_size,
        'today', day_count, 'daily_limit', c_daily_cap, 'daily_cap', day_count >= c_daily_cap);
    end if;

    if day_count >= c_daily_cap then
      update public.students set free_cooldown_until = v_next_midnight where id::text = p_student_id;
      return jsonb_build_object('allowed', false, 'reason', 'cooldown',
        'retry_at', v_next_midnight, 'limit', c_round_size,
        'today', day_count, 'daily_limit', c_daily_cap, 'daily_cap', true);
    end if;

    select count(*) into used_count from public.responses r
    where r.student_id::text = p_student_id and r.class_id is null
      and coalesce(r.reforge_attempted, false) = false
      and r.created_at >= greatest(coalesce(v_cooldown_until, '-infinity'::timestamptz), now() - c_idle_reset);

    if used_count >= c_round_size then
      v_cooldown_until := now() + c_cooldown;
      update public.students set free_cooldown_until = v_cooldown_until where id::text = p_student_id;
      return jsonb_build_object('allowed', false, 'reason', 'cooldown',
        'retry_at', v_cooldown_until, 'limit', c_round_size,
        'today', day_count, 'daily_limit', c_daily_cap, 'daily_cap', false);
    end if;
  end if;

  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,reforge_attempted,reforge_correct,assignment_id,hint_used)
  values(p_student_id::uuid,null,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,v_reforge,p_reforge_correct,null,coalesce(p_hint_used,false))
  returning id into inserted_id;

  if not v_reforge then
    used_count := used_count + 1;
    day_count := day_count + 1;
    if day_count >= c_daily_cap then
      update public.students set free_cooldown_until = v_next_midnight where id::text = p_student_id;
      return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count,
        'limit', c_round_size, 'today', day_count, 'daily_limit', c_daily_cap,
        'cooldown_until', v_next_midnight, 'daily_cap', true);
    end if;
    if used_count >= c_round_size then
      v_cooldown_until := now() + c_cooldown;
      update public.students set free_cooldown_until = v_cooldown_until where id::text = p_student_id;
      return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count,
        'limit', c_round_size, 'today', day_count, 'daily_limit', c_daily_cap,
        'cooldown_until', v_cooldown_until, 'daily_cap', false);
    end if;
  end if;

  return jsonb_build_object('allowed', true, 'id', inserted_id, 'used', used_count,
    'limit', c_round_size, 'today', day_count, 'daily_limit', c_daily_cap);
end;
$function$;

revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) to anon, authenticated;
