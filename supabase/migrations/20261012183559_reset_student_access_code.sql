-- Reset one student's private code.
--
-- Codes are stored only as a SHA-256 digest, so a lost code cannot be looked
-- up. Instead the class owner issues a replacement: the new digest overwrites
-- the old one on the student's existing row, so the old code stops working at
-- once and the row keeps its student_id and claimed_at. Signing in with the new
-- code therefore resumes the same student record and answer history
-- (join_class_with_student_code follows student_id on a claimed row).
--
-- student_access_codes.student_id is unique, which is why this updates in place
-- rather than inserting a second row. A student with no code row at all is
-- refused: "Migrate existing students" is the route for that, and creating the
-- first code here would silently switch a name-only class over to codes.
create or replace function public.reset_student_access_code(p_student_id uuid)
returns table(student_id uuid, student_name text, student_code text, class_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_student public.students%rowtype;
  v_access_id uuid;
  v_code text;
  v_hash text;
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;

  select s.* into v_student from public.students s where s.id = p_student_id;
  if not found then raise exception 'student_not_found'; end if;
  select c.* into v_class from public.classes c
    where c.id = v_student.class_id and c.teacher_user_id = auth.uid();
  if not found then raise exception 'student_not_found'; end if;

  select ac.id into v_access_id from public.student_access_codes ac
    where ac.student_id = v_student.id and ac.class_id = v_class.id
    for update;
  if not found then raise exception 'no_code'; end if;

  loop
    v_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));
    v_hash := encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex');
    exit when not exists (select 1 from public.student_access_codes ac where ac.code_hash = v_hash);
  end loop;

  update public.student_access_codes ac
    set code_hash = v_hash, active = true
    where ac.id = v_access_id;

  student_id := v_student.id;
  student_name := coalesce(v_student.display_name, v_student.name);
  student_code := v_code;
  class_code := v_class.code;
  return next;
end;
$$;
revoke all on function public.reset_student_access_code(uuid) from public, anon;
grant execute on function public.reset_student_access_code(uuid) to authenticated;
