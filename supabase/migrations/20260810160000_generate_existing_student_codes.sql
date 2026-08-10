-- Explicit, teacher-triggered migration helper. It preserves student IDs and
-- response history while assigning one private code to each existing student.

create or replace function public.generate_student_access_codes_for_existing_students(p_class_id uuid)
returns table(student_id uuid, student_name text, student_code text, class_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_student public.students%rowtype;
  v_code text;
  v_hash text;
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  select * into v_class from public.classes where id=p_class_id and teacher_user_id=auth.uid();
  if not found then raise exception 'class_not_owned'; end if;

  for v_student in
    select s.* from public.students s
    where s.class_id=v_class.id
      and not exists(select 1 from public.student_access_codes ac where ac.student_id=s.id and ac.active)
    order by s.created_at,s.id
  loop
    loop
      v_code:=upper(encode(extensions.gen_random_bytes(5),'hex'));
      v_hash:=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex');
      exit when not exists(select 1 from public.student_access_codes ac where ac.code_hash=v_hash);
    end loop;
    insert into public.student_access_codes(class_id,code_hash,student_id)
    values(v_class.id,v_hash,v_student.id);
    student_id:=v_student.id; student_name:=v_student.name; student_code:=v_code; class_code:=v_class.code;
    return next;
  end loop;
end;
$$;

revoke all on function public.generate_student_access_codes_for_existing_students(uuid) from public,anon;
grant execute on function public.generate_student_access_codes_for_existing_students(uuid) to authenticated;
