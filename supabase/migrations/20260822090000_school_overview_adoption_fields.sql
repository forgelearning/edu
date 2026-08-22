-- P3 — give the leadership overview the two fields it needs for adoption and
-- cohort reporting, and nothing more.
--
-- The overview could already answer "what is wrong" (accuracy, misconceptions,
-- spec points) but not "is it working". Trend and adoption are computable from
-- the response created_at values it already receives; grouping by teacher and
-- splitting by access arrangements are not, because the payload omitted both
-- fields. This adds:
--
--   classes.teacher_name   staff name, so classes can be grouped by who teaches
--                          them. Not pupil data.
--   students.extra_time    the access arrangement already recorded per pupil,
--                          so leadership can compare that cohort against the
--                          rest. Reported only in aggregate by the client, and
--                          only above its minimum-cohort threshold.
--
-- Pupil names stay initials-only, exactly as before: the select list below is
-- unchanged in that respect. Nothing else about the scoping changes — it still
-- resolves the caller's school through teacher_profiles.

create or replace function public.get_school_overview()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  with caller_school as (
    select school_key, school_name
    from public.teacher_profiles
    where user_id = auth.uid()
  ), scoped_classes as (
    select c.* from public.classes c
    where coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g')))
          in (select school_key from caller_school)
  ), scoped_students as (
    select s.* from public.students s where s.class_id in (select id from scoped_classes)
  ), scoped_responses as (
    select r.* from public.responses r where r.class_id in (select id from scoped_classes)
  )
  select case
    when auth.uid() is null then jsonb_build_object('authorized', false, 'reason', 'not_signed_in')
    when not exists (select 1 from caller_school) then jsonb_build_object('authorized', false, 'reason', 'no_school')
    else jsonb_build_object(
      'authorized', true,
      'schools', (select coalesce(jsonb_agg(distinct school_key), '[]'::jsonb) from caller_school),
      'school_name', (select school_name from caller_school limit 1),
      'classes', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', code, 'subject', subject, 'teacher_name', teacher_name, 'created_at', created_at)), '[]'::jsonb) from scoped_classes),
      'students', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'class_id', class_id, 'extra_time', extra_time, 'name', (select upper(string_agg(left(w, 1), '.')) from unnest(string_to_array(trim(coalesce(scoped_students.name, '')), ' ')) as w where length(w) > 0) || '.')), '[]'::jsonb) from scoped_students),
      'responses', (select coalesce(jsonb_agg(jsonb_build_object('student_id', student_id, 'class_id', class_id, 'subject', subject, 'is_correct', is_correct, 'misconception_tag', misconception_tag, 'reforge_attempted', reforge_attempted, 'reforge_correct', reforge_correct, 'created_at', created_at)), '[]'::jsonb) from scoped_responses)
    )
  end;
$function$;
