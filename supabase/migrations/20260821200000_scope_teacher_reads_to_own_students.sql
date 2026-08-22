-- S4 — Stop every teacher account reading every free-tier student.
--
-- The previous policies granted rows where `class_id is null` to *any*
-- authenticated user:
--
--   (class_id in (my classes)) or (class_id is null and auth.role() = 'authenticated')
--
-- Free-tier students are exactly the class_id-is-null case, so their names and
-- their whole response history were readable by every signed-up teacher in
-- every school.
--
-- The unlinked arm was not gratuitous: the class dashboard deliberately fetches
-- responses by student id as well as by class id, to catch rows a student wrote
-- before their class link existed (pages/app/teacher.html, "This catches
-- responses where class_id is null"). So this does not simply delete the arm —
-- it narrows it from "any unlinked row" to "an unlinked row belonging to a
-- student in one of my classes", which is what that query actually needs.
--
-- Kept `to public` to match the policies being replaced: auth.uid() is null for
-- the anon role, so the subqueries return nothing and anon is unaffected.

begin;

-- ── students ────────────────────────────────────────────────────────────────
drop policy if exists "Teachers can read students in their classes or unlinked" on public.students;
create policy "Teachers can read students in their classes"
  on public.students for select
  using (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
  );

drop policy if exists "Teachers can update students in their classes or unlinked" on public.students;
create policy "Teachers can update students in their classes"
  on public.students for update
  using (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
  )
  with check (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
  );

-- ── responses ───────────────────────────────────────────────────────────────
drop policy if exists "Teachers can read responses in their classes or unlinked" on public.responses;
create policy "Teachers can read responses for their own students"
  on public.responses for select
  using (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
    or student_id in (
      select s.id from public.students s
      join public.classes c on c.id = s.class_id
      where c.teacher_user_id = auth.uid()
    )
  );

drop policy if exists "Teachers can update responses in their classes or unlinked" on public.responses;
create policy "Teachers can update responses for their own students"
  on public.responses for update
  using (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
    or student_id in (
      select s.id from public.students s
      join public.classes c on c.id = s.class_id
      where c.teacher_user_id = auth.uid()
    )
  )
  with check (
    class_id in (select id from public.classes where teacher_user_id = auth.uid())
    or student_id in (
      select s.id from public.students s
      join public.classes c on c.id = s.class_id
      where c.teacher_user_id = auth.uid()
    )
  );

commit;
