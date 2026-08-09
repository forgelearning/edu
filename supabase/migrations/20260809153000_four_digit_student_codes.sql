-- Student codes for the controlled pilot are four numeric digits.
-- The class code remains required, and the database still stores only a hash.
create or replace function public.generate_student_access_codes(
  p_class_id uuid,
  p_quantity integer default 25
)
returns table(student_code text, class_code text, class_name text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class public.classes%rowtype;
  v_code text;
  v_hash text;
  v_bytes bytea;
  v_i integer;
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 200 then
    raise exception 'quantity_must_be_between_1_and_200';
  end if;
  select * into v_class from public.classes
  where id = p_class_id and teacher_user_id = auth.uid();
  if not found then raise exception 'class_not_owned'; end if;

  for v_i in 1..p_quantity loop
    loop
      v_bytes := extensions.gen_random_bytes(2);
      v_code := lpad((((get_byte(v_bytes, 0) * 256) + get_byte(v_bytes, 1)) % 10000)::text, 4, '0');
      v_hash := encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex');
      exit when not exists (select 1 from public.student_access_codes where code_hash = v_hash);
    end loop;
    insert into public.student_access_codes (class_id, code_hash) values (v_class.id, v_hash);
    student_code := v_code; class_code := v_class.code; class_name := v_class.name;
    return next;
  end loop;
end;
$$;

revoke execute on function public.generate_student_access_codes(uuid, integer) from public, anon;
grant execute on function public.generate_student_access_codes(uuid, integer) to authenticated;
