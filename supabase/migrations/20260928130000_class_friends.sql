-- Class friends.
--
-- Students in the same class can send each other a friend request; once it is
-- accepted, each sees the other's XP (this week and total), accuracy, answers
-- and streak. There is no messaging of any kind.
--
-- Decisions, taken with the product owner on 2026-09-28:
--   * same class only: the target must be a student row in the caller's class;
--   * accuracy is shown to accepted friends, with no per-student opt-out;
--   * mutual: nothing is shared until the other student accepts, and either
--     side can unfriend at any time;
--   * teachers can switch the feature off per class (classes.friends_enabled).
--
-- All access goes through the security-definer functions below. The table has
-- RLS enabled and no policies, so it cannot be read or written directly.
--
-- Metric definitions match the rest of Forge:
--   XP        same rules as calcXP (student-dashboard.html) and the league;
--   accuracy  correct first attempts / first attempts, repair attempts
--             excluded (ForgeMetrics.accuracy in scripts/forge-metrics.js);
--   streak    consecutive UK days with an answer, still alive if the last
--             one was yesterday (calcStreak in student-dashboard.html).
--
-- Depends on 20260928120000_weekly_class_league.sql being applied first only
-- for ordering; it does not use anything from it.

alter table public.classes
  add column if not exists friends_enabled boolean not null default true;

comment on column public.classes.friends_enabled is
  'Whether students in this class can add classmates as friends. Teachers switch it off from Class tools.';

create table if not exists public.student_friendships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  requester_id uuid not null references public.students(id) on delete cascade,
  addressee_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

-- One row per pair, whichever way round it was requested.
create unique index if not exists student_friendships_pair_idx
  on public.student_friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists student_friendships_addressee_idx on public.student_friendships (addressee_id);

alter table public.student_friendships enable row level security;
revoke all on table public.student_friendships from anon, authenticated;

-- Resolve and verify the calling student. Same identity ladder as
-- get_student_assignments(): the signed-in owner, a valid private student
-- code, or (only in a class that has no codes) the name. Returns null when
-- the caller cannot be verified. Internal: not callable from the API.
create or replace function public.forge_verify_class_student(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text
)
returns public.students
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_class_id uuid;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_has_codes boolean;
begin
  select c.id into v_class_id from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if v_class_id is null then return null; end if;

  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) and s.class_id = v_class_id limit 1;
  if not found then return null; end if;

  select exists (select 1 from public.student_access_codes ac where ac.class_id = v_class_id and ac.active) into v_has_codes;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    return v_student;
  elsif length(v_code) >= 8 and exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = v_class_id and ac.student_id = v_student.id and ac.active
      and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  ) then
    return v_student;
  elsif not v_has_codes and length(v_name) > 0 and lower(v_student.name) = lower(v_name) then
    return v_student;
  end if;
  return null;
end;
$function$;

revoke all on function public.forge_verify_class_student(text, text, text, text) from public, anon, authenticated;

-- Everything the Friends card needs, in one call.
create or replace function public.get_class_friends(
  p_student_id text,
  p_class_code text,
  p_student_code text default null,
  p_name text default null
)
returns json
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
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
               when r.is_correct and not coalesce(r.reforge_attempted, false) then 10
               else 0 end), 0)::int as xp_week,
             coalesce(sum(case
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then 10
               else 0 end), 0)::int as xp_total,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false))::int as answered,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false) and r.is_correct)::int as correct
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
    -- Consecutive days ending today or yesterday: in a run, day - row_number
    -- is constant, so group on it and keep the run that reaches the latest day.
    runs as (
      select id, d, d - (row_number() over (partition by id order by d))::int as grp from friend_days
    ),
    streaks as (
      select id, count(*)::int as streak
      from (
        select id, grp, max(d) over (partition by id, grp) as run_end, max(d) over (partition by id) as last_day
        from runs
      ) x
      where run_end = last_day and last_day >= v_today - 1
      group by id
    )
    select json_build_object(
      'enabled', true,
      'friends', coalesce((
        select json_agg(json_build_object(
          'student_id', c.id, 'name', c.name,
          'xp_week', coalesce(fs.xp_week, 0), 'xp_total', coalesce(fs.xp_total, 0),
          'answered', coalesce(fs.answered, 0),
          'accuracy', case when coalesce(fs.answered, 0) > 0 then round(fs.correct * 100.0 / fs.answered) end,
          'streak', coalesce(st.streak, 0)
        ) order by coalesce(fs.xp_week, 0) desc, c.name)
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

-- Send a request. If the other student has already asked, this accepts it.
create or replace function public.send_friend_request(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_target_student_id text
)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
  v_target uuid;
  v_existing public.student_friendships%rowtype;
  v_pending int;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return 'not_allowed'; end if;
  if not exists (select 1 from public.classes c where c.id = v_me.class_id and c.friends_enabled) then return 'disabled'; end if;

  select s.id into v_target from public.students s
  where s.id::text = btrim(coalesce(p_target_student_id, '')) and s.class_id = v_me.class_id and s.id <> v_me.id;
  if v_target is null then return 'not_in_class'; end if;

  select * into v_existing from public.student_friendships f
  where least(f.requester_id, f.addressee_id) = least(v_me.id, v_target)
    and greatest(f.requester_id, f.addressee_id) = greatest(v_me.id, v_target);
  if found then
    if v_existing.status = 'accepted' then return 'already_friends'; end if;
    if v_existing.addressee_id = v_me.id then
      update public.student_friendships set status = 'accepted', responded_at = now() where id = v_existing.id;
      return 'accepted';
    end if;
    return 'already_requested';
  end if;

  -- A cap on unanswered requests stops one student spamming a whole class.
  select count(*) into v_pending from public.student_friendships f
  where f.requester_id = v_me.id and f.status = 'pending';
  if v_pending >= 20 then return 'too_many_pending'; end if;

  insert into public.student_friendships (class_id, requester_id, addressee_id)
  values (v_me.class_id, v_me.id, v_target);
  return 'requested';
end;
$function$;

-- Accept or decline a request sent to the caller.
create or replace function public.respond_friend_request(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_other_student_id text,
  p_accept boolean
)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
  v_row uuid;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return 'not_allowed'; end if;

  select f.id into v_row from public.student_friendships f
  where f.addressee_id = v_me.id and f.requester_id::text = btrim(coalesce(p_other_student_id, '')) and f.status = 'pending';
  if v_row is null then return 'not_found'; end if;

  if p_accept then
    update public.student_friendships set status = 'accepted', responded_at = now() where id = v_row;
    return 'accepted';
  end if;
  delete from public.student_friendships where id = v_row;
  return 'declined';
end;
$function$;

-- Unfriend, or withdraw a request the caller sent. Either side can do this.
create or replace function public.remove_friend(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_other_student_id text
)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
  v_count int;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return 'not_allowed'; end if;

  delete from public.student_friendships f
  where (f.requester_id = v_me.id and f.addressee_id::text = btrim(coalesce(p_other_student_id, '')))
     or (f.addressee_id = v_me.id and f.requester_id::text = btrim(coalesce(p_other_student_id, '')));
  get diagnostics v_count = row_count;
  return case when v_count > 0 then 'removed' else 'not_found' end;
end;
$function$;

revoke all on function public.get_class_friends(text, text, text, text) from public;
revoke all on function public.send_friend_request(text, text, text, text, text) from public;
revoke all on function public.respond_friend_request(text, text, text, text, text, boolean) from public;
revoke all on function public.remove_friend(text, text, text, text, text) from public;
grant execute on function public.get_class_friends(text, text, text, text) to anon, authenticated;
grant execute on function public.send_friend_request(text, text, text, text, text) to anon, authenticated;
grant execute on function public.respond_friend_request(text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.remove_friend(text, text, text, text, text) to anon, authenticated;
