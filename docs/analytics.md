# Forge analytics contract

Forge analytics now has two deliberately different roles:

- **Local diagnostics:** every browser keeps a small, capped history and pending queue in local storage. The internal Product insights page reads this history only.
- **Production event ingestion:** anonymous, sanitised events are submitted to `public.product_events` when Supabase is reachable. This is the source for cross-user analysis; it is not rendered as a browser-local dashboard.

## Event contract

Each event contains:

- `client_event_id`: client-generated idempotency key
- `event_name`: stable event name, maximum 100 characters
- `occurred_at`: ISO timestamp from the client
- `anonymous_id`: stable anonymous browser identifier
- `session_id`: stable session identifier for the current browser session
- `details`: allowlisted primitive metadata only; maximum 20 keys and 200 characters per string
- `received_at`: server timestamp

Question text, submitted answers, student names, email addresses and other free-form learning content must not be placed in `details`.

## Current limitation

The internal Product insights page remains a device-level diagnostic view. It
does not pretend that its local history is a product report. Cross-user
measurement is now provided by protected server-side functions with explicit
authorization and a bounded time window. The server reports are still
directional product metrics rather than causal evidence, and the anonymous
event stream is intentionally not joined to named student records.

The production measurement model is built around:

1. weekly activation and retention by anonymous cohort;
2. Forge and Crucible start-to-completion rates;
3. teacher activation and repeat usage;
4. question-level learning outcomes using authorised response data, never raw answer content in analytics events.

These are now exposed through protected database functions:

- `get_product_analytics(p_days)`: leadership-only global events, cohorts, week-two retention, run completion, daily activity and response outcomes. It requires an authenticated JWT with `app_metadata.role` set to `admin`, `owner` or `leadership`.
- `get_teacher_adoption_snapshot()`: teacher-scoped classes, assignments, students, response volume, active students and recent accuracy. It is limited by `classes.teacher_user_id = auth.uid()`.

The Product insights page renders the first function only after an authorised session is present. The Teacher dashboard renders the second function for the signed-in teacher.

The live table is protected by RLS and accepts inserts only from the public client roles. Read access is intentionally not granted to those roles.
