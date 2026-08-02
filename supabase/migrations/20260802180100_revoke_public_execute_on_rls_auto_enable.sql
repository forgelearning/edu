-- Remove rls_auto_enable() from the public API surface.
--
-- rls_auto_enable() is an event trigger function: it returns `event_trigger`
-- and calls pg_event_trigger_ddl_commands(), which errors outside event
-- trigger context. So a PostgREST call to /rest/v1/rpc/rls_auto_enable does
-- not currently do anything harmful.
--
-- This is hygiene, not an active exploit fix: it is a SECURITY DEFINER
-- function that never needs to be callable by API roles, and the database
-- linter flags it as reachable by anon. Revoking removes it from the exposed
-- surface so it cannot become a problem if the body is ever changed.
--
-- The event trigger that invokes it is unaffected — event triggers execute as
-- the trigger owner and do not consult these grants.

revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
revoke execute on function public.rls_auto_enable() from public;
