-- Let a free (no-account) student read back their own responses.
--
-- The Anvil is the product's misconception-repair surface. For a free student
-- it was permanently and silently empty: anon may INSERT into responses but
-- has no SELECT policy, so anvil.html's direct
--   GET /responses?student_id=eq.<id>
-- returned HTTP 200 with [] rather than an error. The empty-state branch then
-- rendered "No misconceptions yet — complete a Forge quiz first" to a student
-- who had just answered questions and got them wrong.
--
-- The class path does not have this problem because it goes through
-- get_student_own_responses(), a SECURITY DEFINER function gated on the class
-- code. Free students have no class and no code, so that function can never
-- match them: its EXISTS clause joins students to classes.
--
-- This adds the free-tier equivalent, gated on students.free_token — the
-- per-device secret already minted by create_free_student(). The token is the
-- bearer credential, exactly as the class code is for the class path. The
-- student id alone is deliberately not sufficient: it is a uuid that travels
-- in other payloads, and accepting it unaccompanied would let anyone read any
-- student's history by id.
--
-- Scope is narrowed to genuinely free rows (class_id is null) so this can
-- never become a second, weaker route to class data.
--
-- Ordering is ascending on purpose. buildMisconceptions() in anvil.html walks
-- responses in sequence and resets a streak counter as it goes, so it needs
-- chronological order to compute streaks correctly.

create or replace function public.get_free_student_responses(
  p_student_id text,
  p_free_token text
)
returns setof json
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select to_json(r)
  from public.responses r
  where r.student_id::text = p_student_id
    and p_free_token is not null
    and length(btrim(p_free_token)) > 0
    and exists (
      select 1
      from public.students s
      where s.id::text = p_student_id
        and s.free_token = p_free_token
        and s.class_id is null
    )
  order by r.created_at asc;
$function$;

revoke execute on function public.get_free_student_responses(text, text) from public;
grant  execute on function public.get_free_student_responses(text, text) to anon;
grant  execute on function public.get_free_student_responses(text, text) to authenticated;
