-- Friends show the same rank badge as the league and Home.
--
-- get_class_friends shares a friend's lifetime XP (`xp_total`), which the page
-- turns into their rank badge and avatar frame. It was summed over the
-- friend's row in this class only, so a friend who is Journeyman across their
-- classes showed as Apprentice here. It now uses forge_student_lifetime_xp,
-- the same total the league uses since 20261012184445_one_rank_across_classes.
-- Weekly XP, accuracy and streak still count only this class.
--
-- Otherwise identical to the body in 20261007175306_student_match_xp.sql.

create or replace function public.get_class_friends_unchecked(p_student_id text, p_class_code text, p_student_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_me public.students;
  v_enabled boolean;
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Europe/London') at time zone 'Europe/London';
  v_today date := (now() at time zone 'Europe/London')::date;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return null; end if;

  select c.friends_enabled into v_enabled from public.classes c where c.id = v_me.class_id;
  if not coalesce(v_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  return (
    with links as (
      select f.*,
             case when f.requester_id = v_me.id then f.addressee_id else f.requester_id end as other_id
      from public.student_friendships f
      where f.class_id = v_me.class_id and v_me.id in (f.requester_id, f.addressee_id)
    ),
    classmates as (
      select s.id, coalesce(nullif(btrim(s.display_name), ''), nullif(btrim(s.name), ''), 'Student') as name
      from public.students s
      where s.class_id = v_me.class_id and s.id <> v_me.id
    ),
    friend_stats as (
      select l.other_id as id,
             coalesce(sum(case
               when r.created_at < v_week_start then 0
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_week,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false))::int as answered,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false) and r.is_correct and not r.hint_used)::int as correct
      from links l
      left join public.responses r on r.student_id = l.other_id
      where l.status = 'accepted'
      group by l.other_id
    ),
    friend_days as (
      select distinct l.other_id as id, (r.created_at at time zone 'Europe/London')::date as d
      from links l join public.responses r on r.student_id = l.other_id
      where l.status = 'accepted'
    ),
    -- One-day freeze: a run continues across a single missed day (a gap of
    -- two between practice days) and breaks on two or more. Same rule as
    -- scripts/forge-streak.js.
    gaps as (
      select id, d, case when lag(d) over (partition by id order by d) is null
                           or d - lag(d) over (partition by id order by d) > 2 then 1 else 0 end as new_run
      from friend_days
    ),
    runs as (
      select id, d, sum(new_run) over (partition by id order by d) as grp from gaps
    ),
    streaks as (
      select id, count(*)::int as streak
      from (
        select id, grp, max(d) over (partition by id, grp) as run_end, max(d) over (partition by id) as last_day
        from runs
      ) x
      where run_end = last_day and last_day >= v_today - 2
      group by id
    )
    select json_build_object(
      'enabled', true,
      'friends', coalesce((
        select json_agg(json_build_object(
          'student_id', c.id, 'name', c.name,
          'xp_week', coalesce(fs.xp_week, 0) + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = c.id and m.reward_day >= (v_week_start at time zone 'Europe/London')::date), 0),
          -- Across every class row that is this friend (forge_linked_student_ids),
          -- so their badge matches their own Home and the league.
          'xp_total', public.forge_student_lifetime_xp(c.id),
          'answered', coalesce(fs.answered, 0),
          'accuracy', case when coalesce(fs.answered, 0) > 0 then round(fs.correct * 100.0 / fs.answered) end,
          'streak', coalesce(st.streak, 0)
        ) order by (coalesce(fs.xp_week, 0) + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = c.id and m.reward_day >= (v_week_start at time zone 'Europe/London')::date), 0)) desc, c.name)
        from links l join classmates c on c.id = l.other_id
        left join friend_stats fs on fs.id = c.id
        left join streaks st on st.id = c.id
        where l.status = 'accepted'), '[]'::json),
      'incoming', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by l.created_at)
        from links l join classmates c on c.id = l.other_id
        where l.status = 'pending' and l.addressee_id = v_me.id), '[]'::json),
      'outgoing', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by c.name)
        from links l join classmates c on c.id = l.other_id
        where l.status = 'pending' and l.requester_id = v_me.id), '[]'::json),
      'classmates', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by c.name)
        from classmates c
        where not exists (select 1 from links l where l.other_id = c.id)), '[]'::json)
    )
  );
end;
$function$;
