-- Friends for independent students: what a student sees.
-- Rules and tables: 20261008162807_independent_friends.sql. Refuses while
-- app_flags.independent_friends is false.

-- ── Read ─────────────────────────────────────────────────────────────────
create or replace function public.get_independent_friends()
returns json language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := public.forge_independent_friend_caller();
  v_profile public.independent_friend_profiles%rowtype;
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Europe/London') at time zone 'Europe/London';
  v_today date := (now() at time zone 'Europe/London')::date;
begin
  if v_me is null then return json_build_object('available', false); end if;
  select * into v_profile from public.independent_friend_profiles p where p.user_id = v_me;
  if not found then
    return json_build_object('available', true, 'enabled', false,
      -- A suggested name for the switch-on form: the account's own student name.
      'suggested_name', (select public.forge_friend_name(coalesce(nullif(btrim(s.display_name), ''), s.name))
                         from public.students s where s.auth_user_id = v_me and s.class_id is null
                         order by (select count(*) from public.responses r where r.student_id = s.id) desc, s.id limit 1));
  end if;

  return (
    with links as (
      select f.*, case when f.requester_id = v_me then f.addressee_id else f.requester_id end as other_id
      from public.independent_friendships f
      where v_me in (f.requester_id, f.addressee_id)
    ),
    -- Every independent row each accepted friend's account owns.
    friend_rows as (
      select l.other_id as id, s.id as student_id
      from links l join public.students s on s.auth_user_id = l.other_id and s.class_id is null
      where l.status = 'accepted'
    ),
    friend_stats as (
      select fr.id,
             coalesce(sum(case
               when r.created_at < v_week_start then 0
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_week,
             coalesce(sum(case
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_total,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false))::int as answered,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false) and r.is_correct and not r.hint_used)::int as correct
      from friend_rows fr left join public.responses r on r.student_id = fr.student_id
      group by fr.id
    ),
    friend_match as (
      select fr.id,
             coalesce(sum(m.xp) filter (where m.reward_day >= (v_week_start at time zone 'Europe/London')::date), 0)::int as week,
             coalesce(sum(m.xp), 0)::int as total
      from friend_rows fr join public.student_match_rewards m on m.student_id = fr.student_id
      group by fr.id
    ),
    friend_days as (
      select distinct fr.id, (r.created_at at time zone 'Europe/London')::date as d
      from friend_rows fr join public.responses r on r.student_id = fr.student_id
    ),
    -- One-day freeze, as in get_class_friends and scripts/forge-streak.js.
    gaps as (
      select id, d, case when lag(d) over (partition by id order by d) is null
                           or d - lag(d) over (partition by id order by d) > 2 then 1 else 0 end as new_run
      from friend_days
    ),
    runs as (select id, d, sum(new_run) over (partition by id order by d) as grp from gaps),
    streaks as (
      select id, count(*)::int as streak
      from (select id, grp, max(d) over (partition by id, grp) as run_end, max(d) over (partition by id) as last_day from runs) x
      where run_end = last_day and last_day >= v_today - 2
      group by id
    ),
    named as (
      select l.id as friendship_id, l.other_id, l.status, l.requester_id, l.created_at, p.display_name as name
      from links l join public.independent_friend_profiles p on p.user_id = l.other_id
    )
    select json_build_object(
      'available', true,
      'enabled', true,
      'code', v_profile.friend_code,
      'name', v_profile.display_name,
      'friends', coalesce((
        select json_agg(json_build_object(
          'friendship_id', n.friendship_id, 'name', n.name,
          'xp_week', coalesce(fs.xp_week, 0) + coalesce(fm.week, 0),
          'xp_total', coalesce(fs.xp_total, 0) + coalesce(fm.total, 0),
          'answered', coalesce(fs.answered, 0),
          'accuracy', case when coalesce(fs.answered, 0) > 0 then round(fs.correct * 100.0 / fs.answered) end,
          'streak', coalesce(st.streak, 0)
        ) order by coalesce(fs.xp_week, 0) + coalesce(fm.week, 0) desc, n.name)
        from named n
        left join friend_stats fs on fs.id = n.other_id
        left join friend_match fm on fm.id = n.other_id
        left join streaks st on st.id = n.other_id
        where n.status = 'accepted'), '[]'::json),
      -- The requester's chosen name, so the student can tell who it is.
      'incoming', coalesce((
        select json_agg(json_build_object('friendship_id', n.friendship_id, 'name', n.name) order by n.created_at)
        from named n where n.status = 'pending' and n.requester_id = n.other_id), '[]'::json),
      -- No name: the other student has not agreed to share anything yet.
      'outgoing', coalesce((
        select json_agg(json_build_object('friendship_id', l.id, 'created_at', l.created_at) order by l.created_at)
        from links l where l.status = 'pending' and l.requester_id = v_me), '[]'::json)
    )
  );
end;
$$;

revoke all on function public.get_independent_friends() from public, anon;
grant execute on function public.get_independent_friends() to authenticated;
