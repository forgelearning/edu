-- Let a teacher see who is friends with whom in their own classes.
--
-- 20260928130000 locked student_friendships down completely: RLS on, no
-- policies, no grants, so only the student-facing security-definer functions
-- could touch it. This adds one read path for teachers, scoped the same way as
-- "Teachers can read students in their classes" on public.students.
--
-- Read only. Teachers cannot create, accept or remove friendships here, and
-- anon still has no access. A signed-in student is not the teacher of any
-- class, so the policy returns them no rows.

grant select on table public.student_friendships to authenticated;

create policy "Teachers can read friendships in their classes"
  on public.student_friendships
  for select
  to authenticated
  using (class_id in (select c.id from public.classes c where c.teacher_user_id = auth.uid()));
