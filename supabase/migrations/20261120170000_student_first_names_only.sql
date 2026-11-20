-- Store only a student's first name.
--
-- Students used to be asked for a first name and surname, and the full
-- string was kept. From now on every write to students.name and
-- students.display_name (join, sign-up, teacher rename, settings) is reduced
-- to the first word, and subscribers.name likewise. The trigger is the
-- authority: the pages also trim before sending, so a surname never leaves
-- the device, but an old cached page cannot store one either.
--
-- Two students in the same class with the same first name need telling
-- apart on the teacher's register, so only in that case the first letter of
-- the last word is kept ("Alex M"). The class join page sends only the
-- first name and that initial, never the full surname. A teacher renaming a
-- student to "Alex M" keeps the initial for the same reason.
--
-- Existing rows are rewritten separately in
-- 20261120170100_strip_existing_surnames.sql, which cannot be undone.

create or replace function public.forge_first_name(p_name text)
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select nullif(left(split_part(coalesce(public.forge_student_name(p_name), ''), ' ', 1), 30), '');
$$;

create or replace function public.students_first_name_only()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_clean text;
  v_parts text[];
  v_first text;
  v_n integer;
begin
  if tg_op = 'INSERT' or new.name is distinct from old.name then
    v_clean := public.forge_student_name(new.name);
    if v_clean is not null then
      v_parts := regexp_split_to_array(v_clean, ' ');
      v_n := array_length(v_parts, 1);
      v_first := left(v_parts[1], 30);
      if v_n > 1 and new.class_id is not null and exists (
        select 1 from public.students s
        where s.class_id = new.class_id
          and s.id is distinct from new.id
          and lower(split_part(s.name, ' ', 1)) = lower(v_first)
      ) then
        new.name := v_first || ' ' || upper(left(v_parts[v_n], 1));
      else
        new.name := v_first;
      end if;
    end if;
  end if;

  if new.display_name is not null
     and (tg_op = 'INSERT' or new.display_name is distinct from old.display_name) then
    new.display_name := public.forge_first_name(new.display_name);
  end if;

  return new;
end;
$$;

drop trigger if exists students_first_name_only on public.students;
create trigger students_first_name_only
  before insert or update of name, display_name on public.students
  for each row execute function public.students_first_name_only();

create or replace function public.subscribers_first_name_only()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.name is not null then
    new.name := public.forge_first_name(new.name);
  end if;
  return new;
end;
$$;

drop trigger if exists subscribers_first_name_only on public.subscribers;
create trigger subscribers_first_name_only
  before insert or update of name on public.subscribers
  for each row execute function public.subscribers_first_name_only();

revoke execute on function public.students_first_name_only() from public, anon, authenticated;
revoke execute on function public.subscribers_first_name_only() from public, anon, authenticated;
