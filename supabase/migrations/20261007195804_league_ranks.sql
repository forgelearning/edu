-- Weekly league rows carry each student's rank (Apprentice to Master), so the
-- league can show the same avatar frame as the friends list and profile.
--
-- Classmates in the league are not necessarily friends, and only accepted
-- friends see each other's lifetime XP. So the rank is computed here from
-- lifetime XP and returned as a band key ('apprentice' ... 'master'); the
-- lifetime total itself is never returned. Otherwise identical to the body in
-- 20261007175306_student_match_xp.sql.

create or replace function public.get_class_weekly_league(p_student_id text, p_class_code text, p_student_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_class public.classes%rowtype;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_has_codes boolean;
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Europe/London') at time zone 'Europe/London';
  v_result json;
begin
  select c.* into v_class from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if not found then return null; end if;

  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) and s.class_id = v_class.id limit 1;
  if not found then return null; end if;

  -- Same identity ladder as get_student_assignments: signed-in owner, a valid
  -- private student code, or (only in a class that has no codes) the name.
  select exists (select 1 from public.student_access_codes ac where ac.class_id = v_class.id and ac.active) into v_has_codes;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null;
  elsif length(v_code) >= 4 and exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = v_class.id and ac.student_id = v_student.id and ac.active
      and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  ) then
    null;
  elsif not v_has_codes and length(v_name) > 0 and lower(v_student.name) = lower(v_name) then
    null;
  else
    return null;
  end if;

  if not v_class.league_enabled then
    return json_build_object('enabled', false);
  end if;

  with weekly as (
    select s.id,
           coalesce(nullif(btrim(s.display_name), ''), nullif(btrim(s.name), ''), 'Student') as full_name,
           (coalesce(sum(case
             when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
             when r.question_id like '%-CRU' and r.is_correct then 30
             when r.reforge_attempted and r.reforge_correct then 20
             when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
             else 0 end), 0) + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = s.id and m.reward_day >= (v_week_start at time zone 'Europe/London')::date), 0))::int as xp,
           -- Lifetime XP, the same total get_class_friends shares with friends.
           -- Only the rank band derived from it leaves this function.
           (coalesce((select sum(case
             when ra.question_id like '%-ANVIL' then case when ra.is_correct then 30 else 0 end
             when ra.question_id like '%-CRU' and ra.is_correct then 30
             when ra.reforge_attempted and ra.reforge_correct then 20
             when ra.is_correct and not coalesce(ra.reforge_attempted, false) then case when ra.hint_used then 5 else 10 end
             else 0 end) from public.responses ra where ra.student_id = s.id), 0)
             + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = s.id), 0))::int as total_xp
    from public.students s
    left join public.responses r on r.student_id = s.id and r.created_at >= v_week_start
    where s.class_id = v_class.id
    group by s.id, s.display_name, s.name
  ),
  ranked as (
    select id, xp,
           -- Thresholds match RANKS in scripts/forge-ranks.js; dev/test-ranks.js
           -- checks the two stay in step.
           case when total_xp >= 15000 then 'master'
                when total_xp >= 5000 then 'forged'
                when total_xp >= 1500 then 'craftsman'
                when total_xp >= 300 then 'journeyman'
                else 'apprentice' end as rank_key,
           -- "Jess Best" -> "Jess B."; a single word is left as it is.
           case when array_length(parts, 1) > 1
                then parts[1] || ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
                else parts[1] end as short_name,
           rank() over (order by xp desc) as position,
           row_number() over (order by xp desc, full_name) as seq
    from (select *, regexp_split_to_array(btrim(full_name), '\s+') as parts from weekly) w
    where xp > 0
  ),
  me as (select position, seq, xp, rank_key from ranked where id = v_student.id)
  select json_build_object(
    'enabled', true,
    'week_start', v_week_start,
    'ranked', (select count(*) from ranked),
    'you', (select json_build_object('position', me.position, 'xp', me.xp, 'rank', me.rank_key) from me),
    'rows', coalesce((
      select json_agg(json_build_object('seq', r.seq, 'position', r.position, 'name', r.short_name, 'xp', r.xp, 'rank', r.rank_key, 'is_you', r.id = v_student.id) order by r.seq)
      from ranked r
      where r.seq <= 3
         or exists (select 1 from me where abs(r.seq - me.seq) <= 2)
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$function$;
