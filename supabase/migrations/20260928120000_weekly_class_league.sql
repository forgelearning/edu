-- Weekly class league.
--
-- Replaces the old results-screen leaderboard, which read `students` and
-- `responses` with the anon key. RLS only lets a teacher (or a signed-in
-- student reading their own row) read those tables, so it always came back
-- empty. Students now get their league through this function, which checks
-- who is asking the same way get_student_assignments() does, and returns only
-- what the league needs.
--
-- Privacy choices, deliberate:
--   * classmates only, and only when the teacher has not switched it off;
--   * names are shortened to first name + last initial ("Jess B.");
--   * only students with XP this week are ranked, so nobody is listed at the
--     bottom for not having started;
--   * the caller gets the top three plus the two places either side of them,
--     not the whole class.
--
-- XP must match calcXP in pages/app/student-dashboard.html and
-- calcXPFromResponses in pages/app/forge-quiz.html:
--   correct Anvil answer (-ANVIL)             30
--   correct Crucible answer (-CRU)            30
--   correct similar question (reforge)        20
--   correct first answer                      10
-- dev/test-league.js checks the two stay in step.
--
-- The week runs Monday 00:00 to Sunday 23:59 UK time.

alter table public.classes
  add column if not exists league_enabled boolean not null default true;

comment on column public.classes.league_enabled is
  'Whether students in this class see the weekly XP league. Teachers switch it off from Class tools.';

create or replace function public.get_class_weekly_league(
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
  elsif length(v_code) >= 8 and exists (
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
           coalesce(sum(case
             when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
             when r.question_id like '%-CRU' and r.is_correct then 30
             when r.reforge_attempted and r.reforge_correct then 20
             when r.is_correct and not coalesce(r.reforge_attempted, false) then 10
             else 0 end), 0)::int as xp
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

revoke all on function public.get_class_weekly_league(text, text, text, text) from public;
grant execute on function public.get_class_weekly_league(text, text, text, text) to anon, authenticated;
