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

## 20260928 120000 — weekly class league

| File | What it does |
|---|---|
| `20260928120000_weekly_class_league.sql` | Adds `classes.league_enabled` (default on) and `get_class_weekly_league()`, which returns a student's weekly class league after the same identity check as `get_student_assignments()` |

**Applied to production 2026-09-28.** The client code that calls it
(`scripts/forge-league.js`) hides the league when the function is missing, so
the two can ship in either order.

What was checked before review, read-only against production: the ranking
query, XP rules and Monday-00:00-UK week boundary run correctly on real data,
and the name shortening ("Jess B.") handles single names and repeated spaces.
After applying: all 27 classes default to on, a real student gets their
league, a wrong name is rejected, and the security advisors changed only by
the expected new SECURITY DEFINER entry.

Rollback:

```sql
drop function if exists public.get_class_weekly_league(text, text, text, text);
alter table public.classes drop column if exists league_enabled;
```

## 20260928 130000 — class friends

| File | What it does |
|---|---|
| `20260928130000_class_friends.sql` | Adds `classes.friends_enabled` (default on), the `student_friendships` table (RLS on, no policies, no direct grants), an internal identity helper, and `get_class_friends` / `send_friend_request` / `respond_friend_request` / `remove_friend` |

**Applied to production 2026-09-28**, after `20260928120000`. The client
(`scripts/forge-friends.js`) hides the Friends card when the functions are
missing, so the order of deploy and migration does not matter.

Friends are classmates only; nothing is shared until the other student
accepts; accepted friends see each other's XP, accuracy, answers and streak.
No messaging. Unanswered requests are capped at 20 per student.

Checked before review, read-only against production: the streak calculation
(consecutive UK days, alive through yesterday, older runs ignored). After
applying: a real student gets their classmates list, a wrong name is rejected,
`anon`/`authenticated` hold no privileges on `student_friendships` or on
`forge_verify_class_student`, and the advisors added only the four expected
functions plus the intended RLS-without-policies table.

Rollback:

```sql
drop function if exists public.remove_friend(text, text, text, text, text);
drop function if exists public.respond_friend_request(text, text, text, text, text, boolean);
drop function if exists public.send_friend_request(text, text, text, text, text);
drop function if exists public.get_class_friends(text, text, text, text);
drop function if exists public.forge_verify_class_student(text, text, text, text);
drop table if exists public.student_friendships;
alter table public.classes drop column if exists friends_enabled;
```

## 20260928 140000 — teacher read access to class friendships

| File | What it does |
|---|---|
| `20260928140000_teacher_read_class_friendships.sql` | Grants `select` on `student_friendships` to `authenticated`, with one policy limiting it to rows in classes the caller teaches |

**Applied to production 2026-09-28.** Read only: teachers cannot create,
accept or remove friendships, `anon` still has no access, and a signed-in
student teaches no class so the policy returns them nothing. Checked after
applying: `anon` select false, `authenticated` select true and insert/delete
false, one policy on the table.

Rollback:

```sql
drop policy if exists "Teachers can read friendships in their classes" on public.student_friendships;
revoke select on table public.student_friendships from authenticated;
```

## 20260929 181805 — pause friends until individual codes

| File | What it does |
|---|---|
| `20260929181805_pause_class_friends_until_student_codes.sql` | Requires every pupil in a class to have an active private code before friends can be listed or requests sent or accepted. Existing friendships and settings are unchanged. |

**Applied to production 2026-09-29.** Read, send and accept return
`codes_required` for a class with a name-only student. The renamed unchecked
functions and readiness helper have no client EXECUTE grants.

## 20260929 190020 — teacher opt-in for class friends

| File | What it does |
|---|---|
| `20260929190020_friends_teacher_opt_in.sql` | Defaults new classes to Friends off, switches existing classes off at first application, and prevents a reverse request from silently accepting an incoming one. |

**Applied to production 2026-09-29.** The historical
`20260928130000_class_friends.sql` default-on rollout remains in the history;
this migration defines the current default. A replay preserves any class a
teacher has since enabled. No student or friendship rows are changed.

## 20261003 170000 — Practice hints recorded

| File | What it does |
|---|---|
| `20261003170000_responses_hint_used.sql` | Adds `responses.hint_used` (default false). Both answer-writing RPCs gain a `p_hint_used` overload; the existing signatures become wrappers that record false. League and friends XP give a hinted correct first attempt 5 instead of 10, friends accuracy excludes it, and `get_school_overview` returns the flag. |

**Coupled to the client.** Practice sends `p_hint_used` (and `hint_used` on
direct inserts) only when a hint was used, so unhinted answers work before and
after. Hinted answers fail to save until this is applied, so apply it before
the client ships. `dev/test-hint-credit.js` pins the rule in SQL and in every
client copy of the XP and accuracy calculations.

**Applied to production 2026-10-03.** Checked first in a rolled-back transaction against the live schema. Afterwards: column present with no rows flagged, every function carries the rule, client grants unchanged, and `dev/audit-supabase-security.js` passes.

## 20261004 120000 — friends streak freeze

| File | What it does |
|---|---|
| `20261004120000_friends_streak_freeze.sql` | Applies the one-day streak freeze to a classmate's streak in `get_class_friends_unchecked`: one missed day does not break a run, two do, and a streak stays alive while the latest practice day is within two days. Matches `scripts/forge-streak.js`, used by Home and Profile. |

Not coupled: the client does not depend on it, but until it is applied a
classmate's streak on the friends card ignores the freeze.

**Applied to production 2026-10-04.** Checked first in a rolled-back
transaction, including the streak rule on synthetic practice days (3 in a
row → 3, one missed day → 3, two missed → 1, missed yesterday → 2, missed
the last two → 0, matching `scripts/forge-streak.js`). Afterwards the live
function carries the freeze, still has no client EXECUTE grant, and
`dev/audit-supabase-security.js` passes.

## 20261004 150000 — Class Challenge

| File | What it does |
|---|---|
| `20261004150000_class_challenge.sql` | Adds `assignments.challenge_question_ids` (null for an ordinary assignment) and `get_challenge_answers`, which returns how a student's class answered one challenge question: each classmate's first attempt, counted per option. It answers only after the caller has answered that question, and gives no breakdown until five classmates have. |

Students already receive whole assignment rows and teachers read assignments
and responses through RLS, so nothing else changes on the server.

**Coupled to the client for one action only:** setting a challenge writes
`challenge_question_ids`, which fails until this is applied. Ordinary
assignments are unaffected either way.

**Applied to production 2026-10-04.** Checked first in a rolled-back
transaction, including the counting query on synthetic answers (six
students, a later second attempt and a repair attempt correctly ignored).
Afterwards the column exists with all nine existing assignments unchanged,
the function is executable by anon and authenticated but not PUBLIC, a call
with invalid credentials returns null, and `dev/audit-supabase-security.js`
passes.

## 20261004 170000 — assignment archiving

| File | What it does |
|---|---|
| `20261004170000_assignments_archived.sql` | Adds `assignments.archived` (default false). The teacher dashboard has always archived and restored by setting it, but the column never existed, so every archive was rejected. `get_student_assignments` now skips archived rows so class-code students stop seeing finished work; signed-in students read the table directly and the client filters them. |

Not coupled: the client changes are safe before or after. Until this is
applied, archiving still fails, but now with an accurate message.

**Applied to production 2026-10-04.** Checked first in a rolled-back
transaction (column accepted an archive; function compiled; invalid
credentials returned nothing). Afterwards the column exists with all nine
assignments unarchived, `get_student_assignments` skips archived rows and is
still executable by anon, and `dev/audit-supabase-security.js` passes.

## 20261004 190000 — free tier rounds

| File | What it does |
|---|---|
| `20261004190000_free_tier_short_cooldown.sql` | Replaces the free tier's 10-questions-per-day limit with rounds: 10 questions, then a 30-minute break, then another 10. Adds `students.free_cooldown_until`; `record_free_response` locks the student row, refuses with `reason: 'cooldown'` and `retry_at` during a break, and returns `cooldown_until` on the answer that ends a round. Reforge answers stay exempt. |

Order: database first, then the client. The old client still blocks itself
locally at 10 a day, which is harmless; the new client against the old
function would promise a 30-minute break the server does not honour.

**Applied to production 2026-10-04.** Afterwards the new body is live, anon
can still execute it, and a bogus session returns `invalid_session`.

## 20261004 200000 — free tier daily cap

| File | What it does |
|---|---|
| `20261004200000_free_tier_daily_cap.sql` | Adds a 40-question UK-day cap on top of the 10-question rounds. Reaching it sets `free_cooldown_until` to the next Europe/London midnight, so the existing cooldown check does the refusing. Responses now carry `today`, `daily_limit` and `daily_cap` so the client can tell "come back tomorrow" from "30-minute break". Reforge answers stay exempt. |

Not order-sensitive with the client: an older client just shows the 30-minute
break screen for a cap refusal and then gets refused again.

**Applied to production 2026-10-04.** Checked first in a transaction that
always raised (and so rolled back) against production: with 39 answers
already today, the 40th was saved and returned `daily_cap: true` with
`cooldown_until` at 23:00 UTC (UK midnight, BST); the 41st was refused; a
reforge answer was still saved; with the day's count cleared, an ordinary
answer went through. Nothing persisted. Afterwards the new body is live, anon
can execute it, and a bogus session returns `invalid_session`.

## 20261006 175857 — independent student accounts

| File | What it does |
|---|---|
| `20261006175857_student_free_accounts.sql` | Lets a signed-in student claim a guest study record and restore it on another device. Adds own-row read policies for free students and their responses. Removes the timed break while retaining 10-question sets and a server-enforced limit of 40 new answers per UK day. Reforge answers remain exempt. |

Apply this migration before publishing the matching client. Supabase Auth must
allow the deployed `student-dashboard.html` URL as an email redirect. The
default Supabase email template supplies a sign-in link; entering a six-digit
code on the same page requires an OTP email template.

**Applied to production 2026-10-06.** First compiled and exercised in a
rolled-back transaction: a guest row was claimed by an account, restored by
the owner, 40 new answers were accepted, the 41st was refused, and a repair
answer remained available. The migration version, functions, policies, quota
body, and authenticated-only grants were then checked live. The deployed
student dashboard URL was added to the Auth redirect allow list.
