-- S2 + S3 — Make the invite code real, and stop the school being free text.
--
-- Before this migration:
--
--   S2  The invite code was checked only in the browser. Posting straight to
--       /auth/v1/signup with the public anon key created a working teacher
--       account with no invite code at all, and that account could then create
--       classes and read a school dashboard.
--
--   S3  `classes.school` was whatever the teacher typed. get_school_overview
--       scoped by that string, so typing an existing school's name granted
--       read access to every class, student and response in it.
--
-- Both have the same root cause: nothing server-side ever established which
-- school an account belongs to. This adds that missing link.
--
--   teacher_invite_codes  gains the school it admits you to
--   teacher_profiles      one row per provisioned teacher: user -> school
--   claim_teacher_invite  the only way to get such a row
--   a trigger on classes  derives school/school_key from the profile and
--                         refuses the insert when there is no profile
--   get_school_overview   scopes by the profile, not by typed class strings
--
-- Sign-up itself is still open (blocking it needs an auth hook, which is not
-- available on this plan), but an account that has not claimed an invite is
-- inert: it cannot create a class, and with the S4 policies in place it can
-- read nothing.

begin;

-- ── 1. invite codes carry a school ──────────────────────────────────────────
alter table public.teacher_invite_codes
  add column if not exists school_key  text,
  add column if not exists school_name text;

-- Existing invite predates the column. Bind it to the school its holders are
-- already teaching in, derived from their own classes rather than hardcoded.
update public.teacher_invite_codes t
set school_key  = c.school_key,
    school_name = c.school
from (
  select school_key, school, count(*) n
  from public.classes
  where school_key is not null and coalesce(btrim(school), '') <> ''
  group by school_key, school
  order by n desc
  limit 1
) c
where t.school_key is null;

-- ── 2. one row per provisioned teacher ──────────────────────────────────────
create table if not exists public.teacher_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  school_key  text not null,
  school_name text not null,
  invite_code text,
  created_at  timestamptz not null default now()
);

alter table public.teacher_profiles enable row level security;

-- Readable only by its owner; never writable through the API. The only writer
-- is claim_teacher_invite() below, which is SECURITY DEFINER.
drop policy if exists "Teachers can read their own profile" on public.teacher_profiles;
create policy "Teachers can read their own profile"
  on public.teacher_profiles for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.teacher_profiles from anon;
grant select on public.teacher_profiles to authenticated;

-- Backfill: every teacher who already owns classes keeps working untouched.
-- Their school comes from their earliest class.
insert into public.teacher_profiles (user_id, school_key, school_name, invite_code)
select distinct on (c.teacher_user_id)
  c.teacher_user_id,
  coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g'))),
  btrim(c.school),
  'backfill'
from public.classes c
where c.teacher_user_id is not null
  and coalesce(btrim(c.school), '') <> ''
order by c.teacher_user_id, c.created_at
on conflict (user_id) do nothing;

-- ── 3. claiming an invite is what provisions a teacher ──────────────────────
create or replace function public.claim_teacher_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare v public.teacher_invite_codes%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_signed_in');
  end if;

  select * into v
  from public.teacher_invite_codes
  where upper(btrim(code)) = upper(btrim(coalesce(p_code, ''))) and active
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'invalid_code');
  end if;

  if coalesce(btrim(v.school_key), '') = '' then
    return jsonb_build_object('ok', false, 'reason', 'invite_has_no_school');
  end if;

  insert into public.teacher_profiles (user_id, school_key, school_name, invite_code)
  values (auth.uid(), btrim(v.school_key), coalesce(nullif(btrim(v.school_name), ''), btrim(v.school_key)), v.code)
  on conflict (user_id) do update
    set school_key  = excluded.school_key,
        school_name = excluded.school_name,
        invite_code = excluded.invite_code;

  return jsonb_build_object('ok', true, 'school', coalesce(nullif(btrim(v.school_name), ''), btrim(v.school_key)));
end;
$function$;

revoke all on function public.claim_teacher_invite(text) from public, anon;
grant execute on function public.claim_teacher_invite(text) to authenticated;

-- Lets a signed-in teacher find out whether they are provisioned, and under
-- which school, without exposing anyone else's row.
create or replace function public.get_teacher_profile()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select case
    when auth.uid() is null then jsonb_build_object('provisioned', false, 'reason', 'not_signed_in')
    else coalesce(
      (select jsonb_build_object('provisioned', true, 'school', school_name, 'school_key', school_key)
       from public.teacher_profiles where user_id = auth.uid()),
      jsonb_build_object('provisioned', false, 'reason', 'no_invite')
    )
  end;
$function$;

revoke all on function public.get_teacher_profile() from public, anon;
grant execute on function public.get_teacher_profile() to authenticated;

-- ── 4. the school on a class is derived, never accepted from the client ─────
create or replace function public.classes_apply_teacher_school()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare p public.teacher_profiles%rowtype;
begin
  if new.teacher_user_id is null then
    raise exception 'class_requires_teacher'
      using hint = 'A class must be created by a signed-in teacher.';
  end if;

  select * into p from public.teacher_profiles where user_id = new.teacher_user_id;

  if not found then
    raise exception 'teacher_not_provisioned'
      using hint = 'Enter your school invite code before creating a class.';
  end if;

  new.school     := p.school_name;
  new.school_key := p.school_key;
  return new;
end;
$function$;

-- A trigger function has no business being in the REST surface. Calling it
-- directly only raises "trigger functions can only be called as triggers", but
-- the linter is right that it should not be reachable at all.
revoke all on function public.classes_apply_teacher_school() from public, anon, authenticated;

drop trigger if exists classes_apply_teacher_school on public.classes;
create trigger classes_apply_teacher_school
  before insert or update of school, school_key, teacher_user_id on public.classes
  for each row execute function public.classes_apply_teacher_school();

-- ── 5. the overview follows the profile, not the typed string ───────────────
create or replace function public.get_school_overview()
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  with caller_school as (
    -- Membership now comes from the invite a teacher claimed. Deriving it from
    -- the school text on their own classes was the S3 hole: the text was typed
    -- by the same person it was authorising.
    select school_key, school_name
    from public.teacher_profiles
    where user_id = auth.uid()
  ), scoped_classes as (
    select c.* from public.classes c
    where coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g')))
          in (select school_key from caller_school)
  ), scoped_students as (
    select s.* from public.students s where s.class_id in (select id from scoped_classes)
  ), scoped_responses as (
    select r.* from public.responses r where r.class_id in (select id from scoped_classes)
  )
  select case
    when auth.uid() is null then jsonb_build_object('authorized', false, 'reason', 'not_signed_in')
    when not exists (select 1 from caller_school) then jsonb_build_object('authorized', false, 'reason', 'no_school')
    else jsonb_build_object(
      'authorized', true,
      'schools', (select coalesce(jsonb_agg(distinct school_key), '[]'::jsonb) from caller_school),
      -- Display name for the page heading, so it no longer has to guess.
      'school_name', (select school_name from caller_school limit 1),
      'classes', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', code, 'subject', subject, 'created_at', created_at)), '[]'::jsonb) from scoped_classes),
      'students', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'class_id', class_id, 'name', (select upper(string_agg(left(w, 1), '.')) from unnest(string_to_array(trim(coalesce(scoped_students.name, '')), ' ')) as w where length(w) > 0) || '.')), '[]'::jsonb) from scoped_students),
      'responses', (select coalesce(jsonb_agg(jsonb_build_object('student_id', student_id, 'class_id', class_id, 'subject', subject, 'is_correct', is_correct, 'misconception_tag', misconception_tag, 'reforge_attempted', reforge_attempted, 'reforge_correct', reforge_correct, 'created_at', created_at)), '[]'::jsonb) from scoped_responses)
    )
  end;
$function$;

commit;
