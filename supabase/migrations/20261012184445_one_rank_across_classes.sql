-- One rank per student, in every class.
--
-- A student holds one `students` row per class. Home adds up XP across all of
-- them, but the weekly league worked out each row's rank from that row alone,
-- so a student who was Journeyman on Home showed as Apprentice in a class
-- where they had earned less than 300 XP.
--
-- The league now takes rank from the student's lifetime XP across linked rows.
-- Rows count as the same student when they share a link_group or an email
-- account (auth_user_id). The weekly XP and trophies are unchanged and still
-- count only what was earned in this class.
--
-- link_student_rows only links classes that have no codes, which is every
-- class a student now joins, so code students were never linked.
-- link_class_student_rows links two rows when the caller proves both: each
-- side must pass forge_verify_class_student by its private code or as the
-- signed-in owner. The name-only route is deliberately not accepted (p_name
-- is passed as null), so knowing a classmate's name is not enough to merge
-- their XP into yours. scripts/forge-classes.js calls it once per pair of
-- classes a student holds codes for on a device.
--
-- The league body is otherwise identical to 20261008123202_league_trophies.sql.

create or replace function public.forge_linked_student_ids(p_student_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.id
  from public.students s, public.students me
  where me.id = p_student_id
    and (coalesce(s.link_group, s.id) = coalesce(me.link_group, me.id)
         or (me.auth_user_id is not null and s.auth_user_id = me.auth_user_id));
$$;
revoke all on function public.forge_linked_student_ids(uuid) from public, anon, authenticated;

-- Same XP rules as the league's weekly total and get_class_friends.
create or replace function public.forge_student_lifetime_xp(p_student_id uuid)
returns int
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (coalesce((select sum(case
      when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
      when r.question_id like '%-CRU' and r.is_correct then 30
      when r.reforge_attempted and r.reforge_correct then 20
      when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
      else 0 end)
    from public.responses r
    where r.student_id in (select public.forge_linked_student_ids(p_student_id))), 0)
    + coalesce((select sum(m.xp) from public.student_match_rewards m
      where m.student_id in (select public.forge_linked_student_ids(p_student_id))), 0))::int;
$$;
revoke all on function public.forge_student_lifetime_xp(uuid) from public, anon, authenticated;

create or replace function public.link_class_student_rows(
  p_student_id text, p_class_code text, p_student_code text,
  p_other_student_id text, p_other_class_code text, p_other_student_code text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_a public.students;
  v_b public.students;
  v_a_grp uuid;
  v_b_grp uuid;
begin
  v_a := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, null);
  v_b := public.forge_verify_class_student(p_other_student_id, p_other_class_code, p_other_student_code, null);
  if v_a.id is null or v_b.id is null or v_a.id = v_b.id then return false; end if;
  v_a_grp := coalesce(v_a.link_group, v_a.id);
  v_b_grp := coalesce(v_b.link_group, v_b.id);
  if v_a_grp <> v_b_grp then
    update public.students set link_group = v_a_grp
      where coalesce(link_group, id) in (v_a_grp, v_b_grp);
  end if;
  return true;
end;
$$;
revoke all on function public.link_class_student_rows(text, text, text, text, text, text) from public;
grant execute on function public.link_class_student_rows(text, text, text, text, text, text) to anon, authenticated;

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
  -- The Monday the league launched (20260928120000_weekly_class_league.sql).
  c_league_start constant timestamptz := timestamptz '2026-09-28 00:00:00 Europe/London';
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
           -- Lifetime XP across every class row that is the same student
           -- (forge_linked_student_ids), so the rank matches the one Home
           -- shows. Only the rank band derived from it leaves this function.
           public.forge_student_lifetime_xp(s.id) as total_xp
    from public.students s
    left join public.responses r on r.student_id = s.id and r.created_at >= v_week_start
    where s.class_id = v_class.id
    group by s.id, s.display_name, s.name
  ),
  -- XP per student per closed week since launch, same rules as `weekly`.
  past as (
    select x.student_id, x.wk, sum(x.xp)::int as xp
    from (
      select r.student_id,
             (date_trunc('week', r.created_at at time zone 'Europe/London'))::date as wk,
             case
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end as xp
      from public.responses r
      join public.students s on s.id = r.student_id and s.class_id = v_class.id
      where r.created_at >= c_league_start and r.created_at < v_week_start
      union all
      select m.student_id, (date_trunc('week', m.reward_day::timestamp))::date, m.xp
      from public.student_match_rewards m
      join public.students s on s.id = m.student_id and s.class_id = v_class.id
      where m.reward_day >= (c_league_start at time zone 'Europe/London')::date
        and m.reward_day < (v_week_start at time zone 'Europe/London')::date
    ) x
    group by x.student_id, x.wk
    having sum(x.xp) > 0
  ),
  -- A week counts once at least three students earned XP in it.
  tops as (
    select wk, max(xp) as top from past group by wk having count(*) >= 3
  ),
  trophies as (
    select p.student_id, count(*)::int as n
    from past p join tops t on t.wk = p.wk and p.xp = t.top
    group by p.student_id
  ),
  ranked as (
    select id, xp,
           coalesce((select t.n from trophies t where t.student_id = w.id), 0) as trophies,
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
  me as (select position, seq, xp, rank_key, trophies from ranked where id = v_student.id)
  select json_build_object(
    'enabled', true,
    'week_start', v_week_start,
    'ranked', (select count(*) from ranked),
    'trophies', coalesce((select t.n from trophies t where t.student_id = v_student.id), 0),
    'you', (select json_build_object('position', me.position, 'xp', me.xp, 'rank', me.rank_key, 'trophies', me.trophies) from me),
    'rows', coalesce((
      select json_agg(json_build_object('seq', r.seq, 'position', r.position, 'name', r.short_name, 'xp', r.xp, 'rank', r.rank_key, 'trophies', r.trophies, 'is_you', r.id = v_student.id) order by r.seq)
      from ranked r
      where r.seq <= 3
         or exists (select 1 from me where abs(r.seq - me.seq) <= 2)
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$function$;
