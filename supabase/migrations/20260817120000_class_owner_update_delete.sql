-- Teachers could create and read their own classes but never change or remove
-- them: `classes` carried only INSERT and SELECT policies. A class name typo
-- was permanent, and there was no way to remove a test or end-of-year class.
--
-- Worse, the failure was invisible. `anon` and `authenticated` both hold the
-- default table-level DELETE grant, so RLS was the only gate — and PostgREST
-- answers 204 No Content for a DELETE that matches zero rows. A "Delete class"
-- button would have reported success and removed nothing.
--
-- Ownership is `teacher_user_id`. The cascade added in
-- 20260810130000_cascade_class_cleanup.sql already removes the class's
-- assignments, students, access codes and responses, so a permitted delete is
-- complete rather than leaving orphans.

-- Two policies expressed the same rule; keep one.
drop policy if exists "Teachers can view own classes" on public.classes;

drop policy if exists "Teachers can update their own classes" on public.classes;
create policy "Teachers can update their own classes"
  on public.classes
  for update
  to authenticated
  using (teacher_user_id = auth.uid())
  -- WITH CHECK stops a teacher handing their class to another account, or
  -- clearing the owner and stranding the row where nobody can delete it.
  with check (teacher_user_id = auth.uid());

drop policy if exists "Teachers can delete their own classes" on public.classes;
create policy "Teachers can delete their own classes"
  on public.classes
  for delete
  to authenticated
  using (teacher_user_id = auth.uid());

-- Classes predating teacher_user_id (none in production at time of writing)
-- stay unowned and therefore undeletable, which is the safe default: they are
-- reachable by class code and may hold other teachers' student data.
