-- Friends for independent students (signed in, not in a class).
--
-- Class friends (20260928130000) works because a teacher can see and switch it
-- off, and every student holds a private code. An independent student has
-- neither, so this is built on stricter terms, agreed with the product owner
-- on 2026-10-08:
--   * off for everyone until app_flags.independent_friends is set to true
--     (after safeguarding / DPO sign-off); every function below refuses while
--     it is off, so the client cannot switch it on;
--   * signed-in accounts only: identity is auth.uid(), never a device token;
--   * each student opts in from Settings, confirming they are 13 or over;
--   * no search and no list of other students: you can only add someone whose
--     private friend code they have given you;
--   * both sides must accept; nothing about the other student, not even a
--     name, is returned to the requester until they accept;
--   * no messaging; friends see a first name and initial, weekly and total
--     XP, answers, accuracy and streak, the same as class friends;
--   * a student can make a new code at any time, which stops the old one
--     working; turning friends off deletes every friendship and request;
--   * at most 10 failed code attempts an hour and 5 requests waiting at once,
--     so codes cannot be guessed.
--
-- Friendships belong to the account (auth.users), not a student row, so they
-- follow the student across devices. Stats cover every independent student
-- row the account owns. Class rows never count: class friends stay separate.
--
-- All access is through the security-definer functions below. The tables
-- have RLS enabled and no policies, and grants are revoked.

-- ── Site-wide switches ───────────────────────────────────────────────────
create table if not exists public.app_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.app_flags enable row level security;
revoke all on public.app_flags from public, anon, authenticated;
comment on table public.app_flags is
  'Site-wide feature switches, read only by security-definer functions. Change with SQL.';

insert into public.app_flags (key, enabled) values ('independent_friends', false)
on conflict (key) do nothing;

-- ── Tables ───────────────────────────────────────────────────────────────
create table if not exists public.independent_friend_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  friend_code text not null unique check (friend_code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  display_name text not null check (length(display_name) between 1 and 40),
  age_confirmed_at timestamptz not null,
  enabled_at timestamptz not null default now(),
  failed_attempts integer not null default 0,
  failed_window_start timestamptz
);
alter table public.independent_friend_profiles enable row level security;
revoke all on public.independent_friend_profiles from public, anon, authenticated;

create table if not exists public.independent_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.independent_friend_profiles(user_id) on delete cascade,
  addressee_id uuid not null references public.independent_friend_profiles(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);
create unique index if not exists independent_friendships_pair_idx
  on public.independent_friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists independent_friendships_addressee_idx
  on public.independent_friendships (addressee_id, status);
alter table public.independent_friendships enable row level security;
revoke all on public.independent_friendships from public, anon, authenticated;

-- ── Helpers (not callable by clients) ───────────────────────────────────
-- The switch, the account and an independent student row, or null.
create or replace function public.forge_independent_friend_caller()
returns uuid language sql stable security definer set search_path = public, pg_temp
as $$
  select auth.uid()
  where auth.uid() is not null
    and coalesce((select f.enabled from public.app_flags f where f.key = 'independent_friends'), false)
    and exists (select 1 from public.students s where s.auth_user_id = auth.uid() and s.class_id is null);
$$;

-- "Jess Best" -> "Jess B."; letters, spaces, hyphens and apostrophes only.
create or replace function public.forge_friend_name(p_name text)
returns text language sql immutable set search_path = public, pg_temp
as $$
  select case
    when parts is null or array_length(parts, 1) is null then null
    when array_length(parts, 1) > 1 then left(parts[1], 20) || ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
    else left(parts[1], 20) end
  from (select regexp_split_to_array(nullif(btrim(regexp_replace(coalesce(p_name, ''), '[^[:alpha:] ''-]', '', 'g')), ''), '\s+') as parts) x;
$$;

-- Eight characters from a 32-letter alphabet with no 0/O or 1/I. 256 is a
-- multiple of 32, so each byte maps without bias.
create or replace function public.forge_new_friend_code()
returns text language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  c_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
begin
  loop
    v_bytes := extensions.gen_random_bytes(8);
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(c_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.independent_friend_profiles p where p.friend_code = v_code);
  end loop;
  return v_code;
end;
$$;

revoke all on function public.forge_independent_friend_caller() from public, anon, authenticated;
revoke all on function public.forge_friend_name(text) from public, anon, authenticated;
revoke all on function public.forge_new_friend_code() from public, anon, authenticated;
