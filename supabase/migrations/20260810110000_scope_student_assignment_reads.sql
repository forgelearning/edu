-- Scope assignment reads to the owning teacher or an authenticated/verified
-- student. Anonymous class-code students use the verification RPC below;
-- the assignments table itself must never be anonymously enumerable.

drop policy if exists "Allow anon select on assignments" on public.assignments;
drop policy if exists "Students can read assignments" on public.assignments;

create policy "Students can read assignments in their own class"
  on public.assignments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.class_id = assignments.class_id
        and s.auth_user_id = auth.uid()
    )
  );

create or replace function public.get_student_assignments(
  p_student_id text,
  p_class_code text,
  p_student_code text default null,
  p_name text default null
)
returns setof json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
begin
  select c.id into v_class_id
  from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, '')))
  limit 1;

  if v_class_id is null then return; end if;

  select s.* into v_student
  from public.students s
  where s.id::text = btrim(coalesce(p_student_id, ''))
    and s.class_id = v_class_id
  limit 1;

  if not found then return; end if;

  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null;
  elsif length(v_code) >= 8 and exists (
    select 1
    from public.student_access_codes ac
    where ac.class_id = v_class_id
      and ac.student_id = v_student.id
      and ac.active
      and ac.code_hash = encode(
        extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text),
        'hex'
      )
  ) then
    null;
  elsif length(v_name) > 0 and lower(v_student.name) = lower(v_name) then
    null;
  else
    return;
  end if;

  return query
  select to_json(a)
  from public.assignments a
  where a.class_id = v_class_id
  order by a.due_date asc, a.created_at asc;
end;
$$;

revoke all on function public.get_student_assignments(text, text, text, text) from public;
grant execute on function public.get_student_assignments(text, text, text, text) to anon, authenticated;

-- Reconcile production privileges with the student-code migrations.
revoke all on function public.join_class_with_student_code(text, text, text) from public;
grant execute on function public.join_class_with_student_code(text, text, text) to anon, authenticated;

revoke all on function public.get_student_own_responses_with_code(text, text, text) from public;
grant execute on function public.get_student_own_responses_with_code(text, text, text) to anon, authenticated;
