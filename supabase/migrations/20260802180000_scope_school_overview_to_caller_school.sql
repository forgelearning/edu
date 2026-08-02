-- Scope get_school_overview() to the calling teacher's own school(s).
--
-- Before this migration the function was SECURITY DEFINER, took no arguments,
-- performed no authorisation check, and returned every row of classes,
-- students and responses in the database. EXECUTE was held by `anon`, and the
-- anon key ships in the public JavaScript bundle, so the whole dataset was
-- reachable without signing in.
--
-- Confirmed behaviourally before writing this: a class created under the
-- school name 'ZZ Test School (delete me)' appeared in the overview rendered
-- for 'Mayfield Grammar'.
--
-- The exposure included classes.code. A class code is a joining credential —
-- get_class_by_code() and join_class_as_student() both accept one from anon —
-- so leaking codes let an unauthenticated caller enrol in any class.
--
-- Scoping rule: a caller sees the schools at which they own at least one
-- class. That preserves the leadership view within a school while blocking
-- cross-school reads.
--
-- NOTE ON SCHOOL IDENTITY: classes.school is free text typed by the teacher
-- at class creation. Matching is therefore normalised on lower(btrim(...)),
-- but 'Mayfield Grammar' and 'Mayfield Grammar School' remain distinct
-- schools as far as this function is concerned. A real schools table with a
-- foreign key is the durable fix; this migration deliberately does not
-- attempt that data migration.

create or replace function public.get_school_overview()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  with caller_schools as (
    select distinct lower(btrim(c.school)) as school_key
    from public.classes c
    where c.teacher_user_id = auth.uid()
      and c.school is not null
      and btrim(c.school) <> ''
  ),
  scoped_classes as (
    select c.*
    from public.classes c
    where lower(btrim(c.school)) in (select school_key from caller_schools)
  ),
  scoped_students as (
    select s.*
    from public.students s
    where s.class_id in (select id from scoped_classes)
  ),
  scoped_responses as (
    select r.*
    from public.responses r
    where r.class_id in (select id from scoped_classes)
  )
  select case
    when auth.uid() is null then jsonb_build_object('authorized', false, 'reason', 'not_signed_in')
    when not exists (select 1 from caller_schools) then jsonb_build_object('authorized', false, 'reason', 'no_school')
    else jsonb_build_object(
      'authorized', true,
      'schools', (select coalesce(jsonb_agg(distinct school_key), '[]'::jsonb) from caller_schools),
      'classes', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', id,
          'name', name,
          'code', code,
          'subject', subject,
          'created_at', created_at
        )), '[]'::jsonb)
        from scoped_classes
      ),
      'students', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', id,
          'class_id', class_id,
          -- Initials only. Retained from the original function: the overview is
          -- a planning view and must not name individual children.
          'name', (
            select upper(string_agg(left(w, 1), '.'))
            from unnest(string_to_array(trim(coalesce(scoped_students.name, '')), ' ')) as w
            where length(w) > 0
          ) || '.'
        )), '[]'::jsonb)
        from scoped_students
      ),
      'responses', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'student_id', student_id,
          'class_id', class_id,
          'subject', subject,
          'is_correct', is_correct,
          'misconception_tag', misconception_tag,
          'reforge_attempted', reforge_attempted,
          'reforge_correct', reforge_correct,
          'created_at', created_at
        )), '[]'::jsonb)
        from scoped_responses
      )
    )
  end;
$function$;

-- The function now depends on auth.uid(), so an anonymous call can only ever
-- return {"authorized": false}. Revoking EXECUTE from anon makes that explicit
-- rather than relying on the body to fail closed.
revoke execute on function public.get_school_overview() from anon;
revoke execute on function public.get_school_overview() from public;
grant  execute on function public.get_school_overview() to authenticated;
