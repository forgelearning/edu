# Migrations

Reviewed migrations. The entries marked applied have been run against production.

## 20260802 1800xx — security scoping

| File | What it does |
|---|---|
| `20260802180000_scope_school_overview_to_caller_school.sql` | Scopes `get_school_overview()` to the caller's school; revokes `anon` EXECUTE |
| `20260802180100_revoke_public_execute_on_rls_auto_enable.sql` | Removes an event-trigger function from the public API surface |
| `20260802180200_revoke_api_grants_on_teacher_invite_codes.sql` | Drops `anon`/`authenticated` table grants on the invite-code table |
| `20260804170000_enforce_free_daily_quota.sql` | Authorises free response writes by token and enforces the ten-question daily limit server-side |
| `20260809120000_harden_backfill_function_search_path.sql` | Pins the maintenance function search path to `public, pg_temp` |

Applied to production: all migrations listed above.
| `ROLLBACK_20260802180000.sql` | Restores the previous state. Reintroduces the exposures — fix forward instead where possible |

Apply in filename order.

## 20260817 1930xx — school identity

| File | What it does |
|---|---|
| `20260817190621_normalize_school_identity.sql` | Adds a durable `classes.school_key`, a private alias table, a trigger for direct inserts, and scopes School Overview by the canonical key |
| `20260817190646_canonicalize_school_display.sql` | Rewrites existing rows that share a known alias to the canonical display spelling |

Applied to production: both migrations listed above.

After deployment, run `node dev/audit-supabase-security.js`. The check is
read-only and verifies that the overview and invite-code table are not public,
that free-history is token-gated, and that the free quota RPC rejects an
invalid session.

### These are coupled to a client change

`20260802180000` and the `supaRpc()` change in `school-overview.html` **must ship
together**.

The page currently calls `get_school_overview` with the anon key even though the
teacher is signed in. Once the function requires `auth.uid()`, an untokened call
can only return `{"authorized": false}` — so applying the migration without the
client change takes School Overview offline, and shipping the client change
without the migration is a no-op.

The client change is already on `main`. Apply the migration to complete it.

### Verified before writing

Against production, read-only, plus one probe in a schema that was dropped:

- The old `get_school_overview()` had **no authorisation check at all** and
  returned every row of `classes`, `students` and `responses`.
- Its output included `classes.code`. A class code is a joining credential —
  `get_class_by_code()` and `join_class_as_student()` both accept one from
  `anon` — so leaked codes allowed enrolment in any class.
- The new body compiles and returns
  `{"authorized": false, "reason": "not_signed_in"}` to an unauthenticated
  caller.
- Scoping against real data for the one existing teacher: 30/30 classes,
  67/83 students, 1109/1234 responses.

### Expected change in the numbers

The overview totals will drop slightly. The old function counted **all**
students and responses including free-tier users who never joined a class
(16 students, 125 responses at time of writing). Those are not the school's
pupils and are now excluded. This is a correction, not a regression.

### What this does *not* fix

Unknown abbreviations are not guessed or merged automatically. Add an explicit
row to `school_aliases` after confirming that an alias belongs to the same
organisation; the trigger will then canonicalise future writes and the
display migration can safely merge existing rows.

Scoping rule is "a caller sees the schools where they own at least one class."
If School Overview is meant for leadership rather than every teacher, that
needs a separate role check; there is no such role in the schema today.

### Two advisor findings deliberately not migrated

Both turned out to be already safe on inspection:

- `get_teacher_adoption_snapshot()` already scopes every CTE by
  `teacher_user_id = auth.uid()`.
- `get_product_analytics(p_days)` already gates on
  `auth.jwt() -> 'app_metadata' ->> 'role' in ('admin','owner','leadership')`
  and returns `{"authorized": false}` otherwise.

### Not reproducible

The `permission denied for table product_events` seen during review did not
reproduce. `anon` holds INSERT, the INSERT policy exists, and the client sends
the required `client_event_id`. A probe insert as `anon` got past permissions
and failed only on a NOT NULL check, i.e. the write path is open. Re-check the
analytics status after the next deploy before spending time on it.

### Not covered by SQL

Leaked-password protection is a dashboard setting:
Authentication → Providers → Email → "Prevent use of leaked passwords".
