-- Give school grouping a durable identity instead of relying on free-text
-- lower(btrim(...)) in every reader. The alias table is intentionally private:
-- it is maintained by migrations/admin tooling, never by the public client.

create table if not exists public.school_aliases (
  alias_key text primary key,
  canonical_key text not null,
  canonical_name text not null,
  created_at timestamptz not null default now()
);

revoke all on table public.school_aliases from public, anon, authenticated;

-- This is the only known abbreviation in the current production data. Keep it
-- explicit rather than guessing that arbitrary abbreviations are equivalent.
insert into public.school_aliases(alias_key, canonical_key, canonical_name)
values ('mgsg', 'mayfield grammar school', 'Mayfield Grammar School')
on conflict (alias_key) do update
set canonical_key = excluded.canonical_key,
    canonical_name = excluded.canonical_name;

alter table public.classes
  add column if not exists school_key text;

create or replace function public.normalise_class_school_key()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  raw_key text;
  alias_row public.school_aliases%rowtype;
begin
  if new.school is null or btrim(new.school) = '' then
    new.school_key := null;
    return new;
  end if;
  raw_key := lower(regexp_replace(btrim(new.school), '\s+', ' ', 'g'));
  select * into alias_row from public.school_aliases where alias_key = raw_key;
  if found then
    new.school_key := alias_row.canonical_key;
    new.school := alias_row.canonical_name;
  else
    new.school_key := raw_key;
  end if;
  return new;
end;
$$;

drop trigger if exists classes_normalise_school_identity on public.classes;
create trigger classes_normalise_school_identity
before insert or update of school on public.classes
for each row execute function public.normalise_class_school_key();

-- Backfill existing rows through the same alias map. This merges the known
-- MGSG spelling into the canonical Mayfield Grammar School entity while
-- preserving every class and its responses.
update public.classes
set school = school
where school is not null;

create index if not exists classes_school_key_idx on public.classes(school_key);

create or replace function public.get_school_overview()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  with caller_schools as (
    select distinct coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g'))) as school_key
    from public.classes c
    where c.teacher_user_id = auth.uid()
      and c.school is not null
      and btrim(c.school) <> ''
  ),
  scoped_classes as (
    select c.*
    from public.classes c
    where coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g'))) in (select school_key from caller_schools)
  ),
  scoped_students as (
    select s.*
    from public.students s
    where s.class_id in (select id from scoped_classes)
  ),
  scoped_responses as (
    select r.*
    from public.responses r
    where r.class_id in (select id from scoped_classes)
  )
  select case
    when auth.uid() is null then jsonb_build_object('authorized', false, 'reason', 'not_signed_in')
    when not exists (select 1 from caller_schools) then jsonb_build_object('authorized', false, 'reason', 'no_school')
    else jsonb_build_object(
      'authorized', true,
      'schools', (select coalesce(jsonb_agg(distinct school_key), '[]'::jsonb) from caller_schools),
      'classes', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', id,
          'name', name,
          'code', code,
          'subject', subject,
          'created_at', created_at
        )), '[]'::jsonb)
        from scoped_classes
      ),
      'students', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', id,
          'class_id', class_id,
          'name', (
            select upper(string_agg(left(w, 1), '.'))
            from unnest(string_to_array(trim(coalesce(scoped_students.name, '')), ' ')) as w
            where length(w) > 0
          ) || '.'
        )), '[]'::jsonb)
        from scoped_students
      ),
      'responses', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'student_id', student_id,
          'class_id', class_id,
          'subject', subject,
          'is_correct', is_correct,
          'misconception_tag', misconception_tag,
          'reforge_attempted', reforge_attempted,
          'reforge_correct', reforge_correct,
          'created_at', created_at
        )), '[]'::jsonb)
        from scoped_responses
      )
    )
  end;
$function$;

revoke execute on function public.get_school_overview() from anon;
revoke execute on function public.get_school_overview() from public;
grant execute on function public.get_school_overview() to authenticated;
