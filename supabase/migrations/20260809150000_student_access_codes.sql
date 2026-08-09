-- Student access codes
--
-- A class code identifies a class. A student access code identifies one
-- student slot within that class. The plaintext code is returned only once
-- to the authenticated teacher who generated it; the database stores only a
-- SHA-256 digest.

create table if not exists public.student_access_codes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  code_hash text not null unique,
  student_id uuid unique references public.students(id) on delete set null,
  active boolean not null default true,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists student_access_codes_class_id_idx
  on public.student_access_codes(class_id);

alter table public.student_access_codes enable row level security;
revoke all on table public.student_access_codes from anon, authenticated;

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
  v_i integer;
begin
  if auth.uid() is null then
    raise exception 'not_authorized';
  end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 200 then
    raise exception 'quantity_must_be_between_1_and_200';
  end if;

  select * into v_class
  from public.classes
  where id = p_class_id
    and teacher_user_id = auth.uid();
  if not found then
    raise exception 'class_not_owned';
  end if;

  for v_i in 1..p_quantity loop
    loop
      v_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));
      v_hash := encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex');
      exit when not exists (
        select 1 from public.student_access_codes where code_hash = v_hash
      );
    end loop;
    insert into public.student_access_codes (class_id, code_hash)
    values (v_class.id, v_hash);
    student_code := v_code;
    class_code := v_class.code;
    class_name := v_class.name;
    return next;
  end loop;
end;
$$;

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
  if length(v_name) < 1 or length(v_code) < 4 then
    return;
  end if;

  select * into v_class
  from public.classes
  where upper(code) = upper(btrim(p_class_code))
  limit 1;
  if not found then return; end if;

  select * into v_access
  from public.student_access_codes
  where class_id = v_class.id
    and active
    and code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  for update;
  if not found then return; end if;

  if v_access.student_id is null then
    insert into public.students (name, class_id)
    values (v_name, v_class.id)
    returning id into v_student_id;
    update public.student_access_codes
    set student_id = v_student_id, claimed_at = now()
    where id = v_access.id;
  else
    v_student_id := v_access.student_id;
  end if;

  return query
  select to_json(row) from (
    select v_student_id::text as student_id,
           v_class.id::text as class_id,
           v_class.name as class_name,
           v_class.subject as subject,
           (select extra_time from public.students where id = v_student_id) as extra_time
  ) row;
end;
$$;

create or replace function public.get_student_own_responses_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text
)
returns setof json
language sql
security definer
set search_path = public, pg_temp
as $$
  select to_json(r)
  from public.responses r
  where r.student_id::text = p_student_id
    and exists (
      select 1
      from public.student_access_codes ac
      join public.classes c on c.id = ac.class_id
      where ac.student_id::text = p_student_id
        and ac.active
        and upper(c.code) = upper(btrim(p_class_code))
        and ac.code_hash = encode(
          extensions.digest(convert_to(upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g')), 'UTF8'), 'sha256'::text),
          'hex'
        )
    )
  order by r.created_at desc;
$$;

grant execute on function public.generate_student_access_codes(uuid, integer) to authenticated;
grant execute on function public.join_class_with_student_code(text, text, text) to anon, authenticated;
grant execute on function public.get_student_own_responses_with_code(text, text, text) to anon, authenticated;

-- Once a class has issued private codes, the old name+class-code join route
-- must not remain an alternate way into it.
create or replace function public.join_class_as_student(p_code text, p_name text)
returns setof json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_class public.classes%rowtype; v_id uuid;
begin
  select * into v_class from public.classes where code = p_code;
  if not found then return; end if;
  if exists (select 1 from public.student_access_codes where class_id = v_class.id and active) then
    return;
  end if;
  select s.id into v_id from public.students s
  where s.class_id = v_class.id and s.name = p_name
  order by s.created_at asc limit 1;
  if v_id is null then
    insert into public.students (name, class_id) values (p_name, v_class.id)
    returning id into v_id;
  end if;
  return query select to_json(row) from (
    select v_id::text as student_id, v_class.id::text as class_id,
           v_class.name as class_name, v_class.subject as subject,
           coalesce((select extra_time from public.students where id = v_id), 0) as extra_time
  ) row;
end;
$$;

revoke all on function public.generate_student_access_codes(uuid, integer) from anon;
revoke all on function public.join_class_with_student_code(text, text, text) from public;
revoke all on function public.get_student_own_responses_with_code(text, text, text) from public;
grant execute on function public.join_class_with_student_code(text, text, text) to anon, authenticated;
grant execute on function public.get_student_own_responses_with_code(text, text, text) to anon, authenticated;
