# Forge remediation review — 17 August 2026

## Verdict

The serious fixes are substantially implemented in the current `main` branch and deployed build. I verified the changed paths in source, ran the repository suite, exercised the live teacher class lifecycle, and checked the live analytics table. The earlier P0s are no longer present in the implementation, but the most important deployed RLS journey is not automatically verified in this environment because its E2E test is opt-in and skipped without `FORGE_SERVICE_ROLE_KEY`.

**Updated confidence: 7.5/10 for the repaired paths; do not call the release fully closed until the live coded-student E2E runs against production/staging RLS.**

## Fixes confirmed

### Coded student response loss — fixed in implementation

`scripts/forge-response-writer.js` is now the single write router. Coded-class sessions use `ForgeStudentCode.recordResponse()` rather than direct anonymous inserts. Crucible and Anvil both call this shared writer, and Crucible only says an error reached Anvil after the write resolves successfully. Failed saves now produce visible status and a result-page warning rather than a false success claim.

The three previously broken read anchors now retain `studentCode`:

- `pages/app/student-dashboard.html`
- `pages/app/profile.html`
- `pages/app/anvil.html`

`scripts/forge-classes.js` also recovers a missing code from the cached session and reports read failures separately from a genuinely empty response list. This removes the previous “full history appears as zero” failure mode.

### Assignment score disagreement — fixed for current data model

`scripts/forge-assignment-progress.js` is now shared by student and teacher surfaces. It sorts oldest-first, excludes `-RF`, `-ANVIL`, and `-CRU` rows, ignores pre-assignment responses, deduplicates one base question consistently, and exposes per-bank progress. `assignments.html` now carries the coded-student credential, and “Open next assignment” uses `nextBank()` rather than always reopening the first bank.

The 11-case assignment test passes, including order independence, exclusion of Crucible/Anvil rows, pre-assignment filtering, duplicate handling, bank progression, and student/teacher agreement.

### Class lifecycle — fixed and live-tested

The deployed teacher dashboard now has a real Delete class flow requiring the teacher to type the class code. The new migration adds owner-scoped UPDATE/DELETE policies, `ForgeAPI.remove()` rejects no-op deletes, and the existing cascade removes dependent records.

I created `ZZ Fix Delete Audit` (`LE-4DJK`) through the live UI, opened the confirmation panel, entered the code, deleted it, and confirmed by querying the live database that the class no longer exists. The exact prior disposable audit class/code also remains absent.

### Analytics — fixed and live-observed

`scripts/forge-product-analytics.js` no longer sends `resolution=ignore-duplicates`, which required SELECT permission under PostgREST. It now accepts normal inserts and treats a 409 duplicate as already delivered.

Live Supabase currently reports **42 product events**, including recent class events; this is direct evidence that ingestion is no longer universally failing with 401.

### School Overview — materially improved

The live page now opens with `All (27)`, shows `School-wide accuracy`, and keeps A-Level and GCSE tabs available. The prior mismatch—A-Level-only numbers under a school-wide label—is fixed.

## Verification results

`npm run check` passes the current suite:

- content status, question-bank structure, subject counts, specification coverage, stem diversity and language;
- Supabase security smoke checks;
- 65-page build and UI-system checks;
- explicit button types and 168 local route/assets;
- 7,731 MCQ regression checks;
- auth, API failure, persistence recovery and assignment-scoring tests.

The Impeccable implementation detector returned no findings for the changed surfaces. Live browser console inspection after the repaired class workflow showed no errors or warnings.

## Important verification limitation

`npm run check:e2e` currently prints:

`SKIP: coded-student e2e needs FORGE_SERVICE_ROLE_KEY to seed a disposable class.`

That test is well-designed—it exercises the real deployed RLS policies, including Forge, Crucible, Anvil, coded reads, direct-insert rejection, analytics permissions, and cleanup—but a skipped test is not a passing test. It must run in CI or a protected staging environment with a service-role key supplied as a secret. This is the remaining release-gate gap.

## Remaining findings

### P1 — assignment IDs are added but not yet written

`responses.assignment_id` exists and the scoring helper prefers it, but the migration comment and source search show that neither the response RPC nor the Forge quiz currently carries an assignment ID through to the response. Scoring therefore still falls back to bank + creation-time heuristics for new work.

This is much safer and now consistent, but ordinary practice in the same bank after an assignment can still be difficult to distinguish from assigned work. Complete the follow-up: add optional `p_assignment_id` to the response RPCs, preserve it in quiz state/deep links, and assert exact assignment ownership in the E2E test.

### P1 — the class-code generator still uses native `prompt()`

`teacher.html` still calls `window.prompt('How many student codes?', '25')`. This remains a poor accessible/product-owned workflow and was unsupported in the in-app browser. Replace it with an inline dialog with a labelled quantity input, range validation, cancel, loading, error, and copy/download affordances.

### P2 — content anti-cue backlog remains large but is pinned

The full check passes because current baselines are stable, not because all content-quality warnings are gone. `dev/audit-banks.js` reports 393 short-answer cues and 44 recycled-distractor findings at the pinned baseline; null-option distractors are now 0. These remain educational-validity debt and should be reduced deliberately rather than hidden by raising baselines.

### P2 — School Overview scope and privacy still need product decisions

The All tab fixes the key-stage label, but the page still names the organisation `Mayfield Grammar` while the underlying teacher data includes school strings `Mayfield Grammar School`, `mayfield grammar school`, and `MGSG`. Normalise school identity rather than grouping by free-text variants. Revisit the earlier privacy tension around initials/class in performance bands and establish small-cohort suppression rules.

### P2 — minor deletion-copy defect

The delete confirmation template in `teacher.html` emits an extra closing `</b>` after the student-count sentence. Browsers recover and the live panel renders, but the markup should be corrected before adding more destructive-action copy.

### P2 — response writer success semantics should be stricter for authenticated writes

The authenticated branch treats a resolved `ForgeAPI.response()` promise as success. Confirm that the wrapper rejects all non-2xx responses in every build variant, and add a unit test for a resolved-but-non-OK response shape so no future transport wrapper can recreate silent loss.

## Recommended next actions

1. Run `npm run check:e2e` in CI with a staging service-role secret and retain cleanup assertions.
2. Thread `assignment_id` through assignment links, quiz state, response RPCs and teacher/student reconciliation.
3. Replace native student-code generation prompt with an accessible inline dialog.
4. Fix the stray closing tag and add destructive-action UI tests (cancel, wrong code, RLS no-op, successful cascade).
5. Normalise school entities and define SLT privacy/small-sample rules.
6. Reduce the pinned short-cue/recycled-distractor backlog with qualitative review.
