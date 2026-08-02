-- Remove table privileges on teacher_invite_codes from the API roles.
--
-- Current state: anon and authenticated both hold
--   SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
-- on public.teacher_invite_codes.
--
-- Today this is masked. RLS is enabled on the table with no policies at all,
-- so every direct request is denied — the database linter reports this as
-- "RLS Enabled No Policy", which in this case is failing closed and is the
-- only thing preventing anon from reading or truncating the invite codes.
--
-- That is a single point of failure. Anyone who later adds a permissive
-- policy, or runs `alter table ... disable row level security` to debug
-- something, immediately exposes DELETE and TRUNCATE to anonymous callers.
-- Revoking the grants means RLS is no longer the only thing standing in the
-- way.
--
-- Teacher sign-up is unaffected: validate_teacher_invite(p_code) is
-- SECURITY DEFINER and does not rely on the caller's table privileges.
-- That path is the reason no policy is needed here.

revoke all on table public.teacher_invite_codes from anon;
revoke all on table public.teacher_invite_codes from authenticated;

-- validate_teacher_invite stays callable — it is the supported way in.
grant execute on function public.validate_teacher_invite(text) to anon;
grant execute on function public.validate_teacher_invite(text) to authenticated;
