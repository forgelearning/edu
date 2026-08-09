-- The four-digit pilot code format must be accepted by the join function.
create or replace function public.join_class_with_student_code(
  p_class_code text,
  p_student_code text,
  p_name text
)
returns setof json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_access public.student_access_codes%rowtype;
  v_student_id uuid;
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
begin
  if length(v_name) < 1 or length(v_code) < 4 then return; end if;
  select * into v_class from public.classes
  where upper(code) = upper(btrim(p_class_code)) limit 1;
  if not found then return; end if;
  select * into v_access from public.student_access_codes
  where class_id = v_class.id and active
    and code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  for update;
  if not found then return; end if;
  if v_access.student_id is null then
    insert into public.students (name, class_id) values (v_name, v_class.id)
    returning id into v_student_id;
    update public.student_access_codes set student_id=v_student_id, claimed_at=now() where id=v_access.id;
  else
    v_student_id := v_access.student_id;
  end if;
  return query select to_json(row) from (
    select v_student_id::text as student_id, v_class.id::text as class_id,
           v_class.name as class_name, v_class.subject as subject,
           (select extra_time from public.students where id=v_student_id) as extra_time
  ) row;
end;
$$;

revoke execute on function public.join_class_with_student_code(text, text, text) from public;
grant execute on function public.join_class_with_student_code(text, text, text) to anon, authenticated;
