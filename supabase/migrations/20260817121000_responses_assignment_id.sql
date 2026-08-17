-- Responses have no link to the assignment they were answered for, so
-- attainment has to be inferred from bank + creation time. That heuristic
-- conflates ordinary practice with assigned work whenever a student practises a
-- bank that is also assigned, and it is the reason two surfaces could compute
-- different scores from the same rows.
--
-- This adds the column and nothing else. `ForgeAssignmentProgress` already
-- prefers an exact assignment_id match and falls back to the creation-time
-- heuristic when the column is null, so existing rows keep scoring exactly as
-- they do today and the change is safe to apply before anything writes it.
--
-- FOLLOW-UP (not in this migration): give
-- record_student_response_with_code / record_free_response an optional
-- p_assignment_id, and have forge-quiz.html carry the assignment id through
-- from the assignments page. Until then the column stays null and the heuristic
-- continues to apply.

alter table public.responses
  add column if not exists assignment_id uuid;

-- A deleted assignment must not take its evidence with it: the responses are
-- still a record of what the student answered.
alter table public.responses
  drop constraint if exists responses_assignment_id_fkey,
  add constraint responses_assignment_id_fkey
    foreign key (assignment_id) references public.assignments(id) on delete set null;

-- Assignment cards read a class's rows and group by assignment.
create index if not exists responses_assignment_id_idx
  on public.responses (assignment_id)
  where assignment_id is not null;
