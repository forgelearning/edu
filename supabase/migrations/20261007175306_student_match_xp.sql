-- Accept current four-character student codes in shared identity checks.
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
  elsif length(v_code) >= 4 and exists (
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

-- Idempotent, student-owned Match pairs rewards. The browser may retry a
-- completed round, but the database awards a topic only once per UK day.
create table if not exists public.student_match_rewards (
  student_id uuid not null references public.students(id) on delete cascade,
  bank text not null check (length(bank) between 2 and 80 and bank ~ '^[A-Za-z0-9._-]+$'),
  reward_day date not null,
  pairs smallint not null check (pairs in (3, 4)),
  xp smallint generated always as (pairs * 5) stored,
  awarded_at timestamptz not null default now(),
  primary key (student_id, bank, reward_day)
);
create index if not exists student_match_rewards_day_idx
  on public.student_match_rewards (reward_day, student_id);
alter table public.student_match_rewards enable row level security;
revoke all on public.student_match_rewards from public, anon, authenticated;

-- A verified class session or the owner account can claim and read rewards.
-- Free independent sessions do not earn XP. Names are accepted only for
-- legacy classes without private codes, as in the existing class RPCs.
create or replace function public.claim_student_match_xp(
  p_student_id text, p_class_code text, p_student_code text, p_name text,
  p_bank text, p_pairs integer, p_day date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student public.students%rowtype;
  v_verified public.students%rowtype;
  v_today date := (now() at time zone 'Europe/London')::date;
  v_awarded integer := 0;
  v_total integer;
begin
  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id,'')) limit 1;
  if v_student.id is null then raise exception 'invalid_student_session'; end if;
  if auth.uid() is null or v_student.auth_user_id is distinct from auth.uid() then
    if v_student.class_id is null then raise exception 'invalid_student_session'; end if;
    v_verified := public.forge_verify_class_student(p_student_id,p_class_code,p_student_code,p_name);
    if v_verified.id is distinct from v_student.id then raise exception 'invalid_student_session'; end if;
  end if;
  if p_bank is null or length(p_bank) not between 2 and 80
     or p_bank !~ '^[A-Za-z0-9._-]+$'
     or p_pairs not in (3,4)
     or p_day is null or p_day < v_today - 30 or p_day > v_today then
    raise exception 'invalid_match_reward';
  end if;
  if not exists (
    select 1 from public.student_match_rewards r
    where r.student_id = v_student.id and r.bank = p_bank and r.reward_day = p_day
  ) and (
    select count(*) from public.student_match_rewards r
    where r.student_id = v_student.id and r.reward_day = p_day
  ) >= 10 then
    raise exception 'match_daily_limit';
  end if;
  insert into public.student_match_rewards(student_id,bank,reward_day,pairs)
  values (v_student.id,p_bank,p_day,p_pairs)
  on conflict do nothing;
  get diagnostics v_awarded = row_count;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    select coalesce(sum(r.xp),0)::integer into v_total
    from public.student_match_rewards r
    join public.students s on s.id = r.student_id
    where s.auth_user_id = auth.uid();
  else
    select coalesce(sum(r.xp),0)::integer into v_total
    from public.student_match_rewards r where r.student_id = v_student.id;
  end if;
  return jsonb_build_object('awarded',v_awarded = 1,'xp',case when v_awarded = 1 then p_pairs * 5 else 0 end,'xp_total',v_total);
end;
$$;
revoke all on function public.claim_student_match_xp(text,text,text,text,text,integer,date) from public, anon, authenticated;
grant execute on function public.claim_student_match_xp(text,text,text,text,text,integer,date) to anon, authenticated;

create or replace function public.get_student_match_xp(
  p_student_id text, p_class_code text, p_student_code text, p_name text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student public.students%rowtype;
  v_verified public.students%rowtype;
  v_total integer;
begin
  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id,'')) limit 1;
  if v_student.id is null then raise exception 'invalid_student_session'; end if;
  if auth.uid() is null or v_student.auth_user_id is distinct from auth.uid() then
    if v_student.class_id is null then raise exception 'invalid_student_session'; end if;
    v_verified := public.forge_verify_class_student(p_student_id,p_class_code,p_student_code,p_name);
    if v_verified.id is distinct from v_student.id then raise exception 'invalid_student_session'; end if;
  end if;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    select coalesce(sum(r.xp),0)::integer into v_total
    from public.student_match_rewards r
    join public.students s on s.id = r.student_id
    where s.auth_user_id = auth.uid();
  else
    select coalesce(sum(r.xp),0)::integer into v_total
    from public.student_match_rewards r where r.student_id = v_student.id;
  end if;
  return jsonb_build_object('xp_total',v_total);
end;
$$;
revoke all on function public.get_student_match_xp(text,text,text,text) from public, anon, authenticated;
grant execute on function public.get_student_match_xp(text,text,text,text) to anon, authenticated;


-- Include match rewards in student league and friends totals.
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
             else 0 end), 0) + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = s.id and m.reward_day >= (v_week_start at time zone 'Europe/London')::date), 0))::int as xp
    from public.students s
    left join public.responses r on r.student_id = s.id and r.created_at >= v_week_start
    where s.class_id = v_class.id
    group by s.id, s.display_name, s.name
  ),
  ranked as (
    select id, xp,
           -- "Jess Best" -> "Jess B."; a single word is left as it is.
           case when array_length(parts, 1) > 1
                then parts[1] || ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
                else parts[1] end as short_name,
           rank() over (order by xp desc) as position,
           row_number() over (order by xp desc, full_name) as seq
    from (select *, regexp_split_to_array(btrim(full_name), '\s+') as parts from weekly) w
    where xp > 0
  ),
  me as (select position, seq, xp from ranked where id = v_student.id)
  select json_build_object(
    'enabled', true,
    'week_start', v_week_start,
    'ranked', (select count(*) from ranked),
    'you', (select json_build_object('position', me.position, 'xp', me.xp) from me),
    'rows', coalesce((
      select json_agg(json_build_object('seq', r.seq, 'position', r.position, 'name', r.short_name, 'xp', r.xp, 'is_you', r.id = v_student.id) order by r.seq)
      from ranked r
      where r.seq <= 3
         or exists (select 1 from me where abs(r.seq - me.seq) <= 2)
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$function$;

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
             coalesce(sum(case
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_total,
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
          'xp_total', coalesce(fs.xp_total, 0) + coalesce((select sum(m.xp) from public.student_match_rewards m where m.student_id = c.id), 0),
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

-- Teachers see reward totals for their own class league, including when
-- students have no quiz responses this week.
create or replace function public.get_teacher_class_match_rewards(p_class_id uuid)
returns table(student_id uuid, reward_day date, xp smallint)
language sql
stable
security definer
set search_path = ''
as $$
  select r.student_id, r.reward_day, r.xp
  from public.student_match_rewards r
  join public.students s on s.id = r.student_id
  join public.classes c on c.id = s.class_id
  where c.id = p_class_id and c.teacher_user_id = auth.uid()
$$;
revoke all on function public.get_teacher_class_match_rewards(uuid) from public, anon, authenticated;
grant execute on function public.get_teacher_class_match_rewards(uuid) to authenticated;
