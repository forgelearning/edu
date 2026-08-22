-- Read-only view of how far a class has moved onto private student codes.
--
-- The machinery to issue codes has existed since 20260810160000, but nothing
-- ever told a teacher their class still needs it: the dashboard shows the same
-- two buttons whether every pupil has a code or none do. In the live pilot that
-- produced 26 of 27 classes with no codes at all, so every pupil in them signs
-- in by name.
--
-- `student_access_codes` carries no RLS policies (deliberately fail-closed —
-- the table holds code hashes), so a teacher cannot count coverage from the
-- client. This definer function exposes counts only, never a hash, and returns
-- no row at all unless the caller owns the class.
create or replace function public.class_student_code_coverage(p_class_id uuid)
returns table(students integer, with_code integer, spare_codes integer)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    (select count(*) from public.students s where s.class_id = c.id)::int,
    (select count(*) from public.students s
      where s.class_id = c.id
        and exists (
          select 1 from public.student_access_codes ac
          where ac.student_id = s.id and ac.active
        ))::int,
    (select count(*) from public.student_access_codes ac
      where ac.class_id = c.id and ac.active and ac.student_id is null)::int
  from public.classes c
  where c.id = p_class_id
    and c.teacher_user_id = auth.uid();
$$;

revoke all on function public.class_student_code_coverage(uuid) from public, anon;
grant execute on function public.class_student_code_coverage(uuid) to authenticated;
