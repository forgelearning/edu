-- Class Challenge: an assignment where every student gets the same fixed
-- questions and, after answering each one, sees how the class answered it.
--
-- challenge_question_ids is null for an ordinary assignment. Students already
-- receive whole assignment rows (get_student_assignments returns to_json(a)),
-- and teachers read assignments and responses through RLS, so neither needs a
-- new function. Only the class-wide answer counts do, because a student cannot
-- read classmates' responses.

alter table public.assignments
  add column if not exists challenge_question_ids text[];

-- How the class answered one challenge question: each classmate's first
-- attempt, counted per option. Two privacy rules:
--   * only after the caller has answered that question themselves, so the
--     counts cannot be used to pick an answer;
--   * no breakdown until at least five classmates have answered, so a count
--     cannot point at one person.
create or replace function public.get_challenge_answers(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_assignment_id uuid,
  p_question_id text
)
returns json
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
  v_ids text[];
  v_answered int;
  v_counts json;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return null; end if;

  select a.challenge_question_ids into v_ids
  from public.assignments a
  where a.id = p_assignment_id and a.class_id = v_me.class_id;
  if v_ids is null or not (p_question_id = any (v_ids)) then
    return json_build_object('allowed', false, 'reason', 'not_a_challenge_question');
  end if;

  if not exists (
    select 1 from public.responses r
    where r.student_id = v_me.id and r.assignment_id = p_assignment_id
      and r.question_id = p_question_id and not coalesce(r.reforge_attempted, false)
  ) then
    return json_build_object('allowed', false, 'reason', 'answer_first');
  end if;

  with firsts as (
    select distinct on (r.student_id) r.student_id, r.selected_option
    from public.responses r
    join public.students s on s.id = r.student_id and s.class_id = v_me.class_id
    where r.assignment_id = p_assignment_id and r.question_id = p_question_id
      and not coalesce(r.reforge_attempted, false)
    order by r.student_id, r.created_at asc
  )
  select (select count(*)::int from firsts),
         (select coalesce(json_object_agg(selected_option, n), '{}'::json)
          from (select selected_option, count(*)::int as n from firsts group by selected_option) c)
  into v_answered, v_counts;

  if v_answered < 5 then
    return json_build_object('allowed', true, 'answered', v_answered, 'hidden', true);
  end if;
  return json_build_object('allowed', true, 'answered', v_answered, 'options', v_counts);
end;
$function$;

revoke all on function public.get_challenge_answers(text, text, text, text, uuid, text) from public;
grant execute on function public.get_challenge_answers(text, text, text, text, uuid, text) to anon, authenticated;
