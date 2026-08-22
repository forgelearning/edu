-- teacher_profiles is written only by claim_teacher_invite(), which is
-- SECURITY DEFINER and so unaffected by these grants. RLS already denied direct
-- writes (the table has a SELECT policy and no INSERT/UPDATE/DELETE policy),
-- but the default grants Supabase applies at table creation still left
-- INSERT/UPDATE/DELETE on the role. Remove them so the invariant does not rest
-- on RLS alone: a teacher must not be able to provision themselves into a
-- school without an invite.

revoke insert, update, delete on public.teacher_profiles from authenticated;
