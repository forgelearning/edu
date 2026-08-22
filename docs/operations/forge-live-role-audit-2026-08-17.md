# Forge live role audit — 17 August 2026

## Executive assessment

Forge has a strong, distinctive learning loop and a visually coherent product. The teacher experience is especially effective at turning response data into a recommended classroom action. The current live build is not release-safe for coded students, however: Crucible silently fails to save every answer, student Anvil/Profile/Dashboard fail to read already-saved coded-student responses, and assignment scores disagree across student and teacher views. These are data-integrity and trust defects, not cosmetic polish issues.

**Readiness judgement: 5.5/10.** The core practice loop is usable and the automated content/static checks are strong, but the coded-student analytics and Crucible persistence failures break two of the three named learning surfaces. I would hold a wider school rollout until the P0 items below are fixed and covered by live integration tests.

## Scope and method

The audit used the deployed GitHub Pages build at `https://forgelearning.github.io/edu/`, the live Supabase project, and the repository at `/Users/michaelzanier/edu`.

The end-to-end disposable journey covered:

- teacher sign-in, class creation, student-code generation, assignment creation, all dashboard views, student drill-down, corrective starters, Class Mode, and School Overview;
- student join, assignment discovery, two complete eight-question assignment sessions, wrong-answer scaffolds, a successful reforge, Anvil, Profile, Dashboard, a full six-question/timed Crucible, settings, theme switching, sign-out, desktop and 390 × 844 mobile layouts;
- SLT subject/class/misconception/performance-band/spec-point views, sorting, disclosure behaviour, and export initiation;
- browser console/network evidence, source tracing, direct database verification, and the full repository check suite.

The disposable audit class, student, 17 responses, assignment, access code, and unused teacher invite were deleted after testing. Post-cleanup database counts were all zero.

## Severity summary

| Priority | Finding | Impact |
|---|---|---|
| P0 | Crucible writes violate `responses` RLS, but the UI reports success | Timed work and misconceptions are lost without warning |
| P0 | Coded-student Anvil, Profile, and Dashboard show zero despite 17 stored responses | The repair loop and progress reporting are unavailable |
| P0 | Assignment scoring disagrees: student 0%, teacher 38%, quiz evidence 5/16 (31%) | Students and teachers cannot trust attainment data |
| P1 | Teacher-authenticated browser blocks/redirects the student journey | Shared-device and dual-role workflows collide |
| P1 | “Open next assignment” does not advance to the unfinished bank | Students can be sent back to already-completed work |
| P1 | Product analytics repeatedly returns 401 | Adoption/behaviour reporting is incomplete and noisy |
| P1 | No true class deletion in teacher UI | Teachers cannot safely manage the class lifecycle |
| P1 | School privacy claim conflicts with initials + class disclosure | Small cohorts can make students re-identifiable |
| P2 | Native `prompt()` is used for student-code generation | Poor accessibility, weak validation, incompatible with the in-app browser |
| P2 | Answer controls remain semantically enabled after submission | Keyboard/screen-reader state does not match behaviour |
| P2 | Class Mode preserves a scrolled position and clips the next question heading | Projector presentation can begin with missing context |
| P2 | Repeated implausible distractor contaminates multiple Economics questions | Pattern cueing weakens assessment validity |

## Student journey

### What works

- Join validation is clear. Empty and invalid class states provide specific feedback, including `Class code not found`.
- The 390 × 844 join and assignment layouts have no horizontal overflow. Labels, fields, options, fixed bottom navigation, and dark-theme contrast are all readable.
- Due-soon assignment discovery works, and completion moves from 0/16 to 8/16 to 16/16.
- Both eight-question banks can be completed. Per-session quiz summaries calculate their own scores correctly (3/8 and 2/8 in this run).
- Wrong-answer feedback, scaffold, reforge, next-question progression, and a correct reforge all function in the ordinary Forge session.
- Crucible pre-start information is good: six questions, five minutes, no scaffolds/reforges, and an explicit statement that errors go to Anvil. The timer counted down and the six-question run completed with a correct 4/6 summary.
- Theme switching and student sign-out work. The student visual system is polished, consistent, and recognisably Forge.

### Critical failures

#### Crucible silently loses all response data

Every Crucible answer produced:

`new row violates row-level security policy for table "responses"`

The source uses a direct `responses` insert in `pages/app/crucible.html`, whereas coded students have a purpose-built `record_student_response_with_code` RPC. Despite the failed writes, each wrong answer says it was sent to Anvil and the result page repeats `Sent to your Anvil`. No user-visible failure state appears. Database response count stayed at 17 before and after the six-question run.

**Fix:** route Crucible through the coded response RPC, await the write, expose retryable per-answer/save state, and only claim Anvil delivery after confirmation. Add a deployed RLS integration test—not only mocked failure-contract tests.

#### Coded-student analytics read as zero

The database held 17 Forge responses, including 11 wrong answers across eight misconception tags and one successful reforge. Nevertheless:

- Anvil: Active 0, Resolved 0, Total 0, `No misconceptions yet`;
- Profile: 0%, 0 questions, 0 active misconceptions;
- Dashboard: `Your first practice session is waiting.`

Assignments could still read their completion state, so this is not missing data. Runtime requests fell back to the legacy own-responses path rather than consistently retaining/using the coded-student credential path.

**Fix:** make the student-code credential part of one canonical session object; reject incomplete coded sessions instead of silently taking the legacy path; add an integration fixture that joins by access code, records a wrong answer, reloads all three pages, and asserts the same misconception/progress.

#### Assignment score is inconsistent on every relevant surface

Observed after full completion:

- session summaries: 3/8 and 2/8, therefore 5/16 = 31.25%;
- student assignment card: `0% score` at both 8/16 and 16/16;
- teacher assignment card: `38% accuracy` / `38% score`;
- teacher overall class accuracy: 35% over 17 rows.

The teacher calculation deduplicates rows by bank and question ID after stripping `-RF`, then keeps the first row. This makes reforge/order semantics capable of changing the score and is not an assignment-specific model. The current response model also lacks an `assignment_id`, so ordinary practice and assigned work in the same bank can be conflated by time heuristics.

**Fix:** persist `assignment_id` and `session_id`; define whether first attempt, final attempt, or reforge contributes to attainment; calculate once server-side and reuse the result on student and teacher surfaces.

### Other student issues

- `Open next assignment` continued to open `ECON-1.1` after that bank was complete instead of advancing to unfinished Inflation.
- A teacher session on the same origin changes student Settings to the teacher route; joining as a student then redirects to `teacher.html`, and direct student dashboard navigation redirects back. Signing the teacher out was required. This is a realistic shared-device failure.
- After answering, option buttons have visual answered states but remain `disabled=false` with no `aria-disabled`. Clicks are ignored in code, but semantics and focus behaviour remain wrong.
- Quiz summary labels a generic definition as `Strongest repaired misconception` and exposes a raw code such as `MC-INF-03` for the remaining weak area.
- A `Teacher? View dashboard` link appears in the student quiz summary and leaks an irrelevant role path.
- Several explanations are long mini-essays rather than the promised rapid correction. Some scaffolds merely restate that distractors confuse relationships.
- Notification permission was not granted during this audit, so delivery was not assessed.

## Teacher journey

### What works

- Class creation worked and produced a usable join code. The created class appeared first in the class picker.
- Assignment creation worked with two selected Economics banks and a required due date.
- The populated command centre is strong: 35% class accuracy, eight open misconception signals, 17 answers, 1/1 reforges passed, and a clear recommended next action.
- Priority signals translate raw tags into human-readable labels and rank frequency.
- Class overview sorts weakest-first and includes answered count, accuracy, weakest topic, top misconception, and extra-time controls.
- Student drill-down exposes accuracy, question count, active misconceptions, fire counts, reforge history, and spec-point breakdown.
- Spec-point view correctly separated `2.1.2` at 25% and `1.1` at 44%.
- Corrective Starters is the best teacher feature tested. It converted the leading CPI/RPI misconception into a ready-to-use comparison-table starter with an answer guide and a clear next-intervention queue.
- Class Mode has broad subject/topic coverage, keyboard reveal, clear correct-answer treatment, and useful explanations.

### Teacher issues

- `Generate student codes` uses `window.prompt('How many student codes?', '25')`. This failed in the in-app browser, has weak validation/error affordance, and is unsuitable for accessible bulk workflow. A disposable code had to be inserted through the backend to complete the live journey.
- There is no real class deletion workflow. Removing a class from the local class list intentionally leaves the server-side class, students, assignments, and responses intact. The requested audit class therefore required backend cleanup.
- Teacher assignment accuracy is wrong/inconsistent as described above.
- Class Mode retained `scrollY=247` after topic selection and on the next question, clipping the question heading at the top of the projector view.
- The revealed Class Mode explanation can become a very dense paragraph for projection. A short key-point/diagram-first reveal would scan better.
- Class creation subject selection was fragile under label-driven interaction; setting the underlying `econ` value worked.
- The teacher has no clear school switcher despite owning classes associated with different schools. The School Overview appears tied to one inferred school.

## SLT / School Overview

### Useful data provided

The Mayfield Grammar overview delivered a concise operational snapshot:

- A-Level: 26 classes, 75% accuracy, 60 enrolled, one active in seven days, 996 answers;
- GCSE: three classes, 76% accuracy, nine enrolled, zero active in seven days, 66 answers;
- sortable subject table;
- class comparison with students, questions, recent activity, accuracy, and engagement;
- misconception league with tag, label, fire count, reforges, and a prevalence visual;
- top/bottom performance bands using initials and class;
- spec-point view (empty for legacy responses in the observed tenant);
- a leadership-focus card selecting a class needing attention.

This is useful for spotting low engagement, weak classes/subjects, prevalent misconceptions, and where a leader should ask a department to investigate. The action orientation is better than a dashboard of decorative charts.

### Limitations and risks

- The page says `no individual student names` but performance bands show initials plus class. In a small cohort this is readily re-identifiable.
- Relative `bottom 10%` wording can label a strong student as needing intervention; in the observed two-student eligible GCSE cohort, the bottom student still had 73%.
- The leadership-focus algorithm selected a newly created/no-answer class. This may be technically correct but is less useful than separating `not yet adopted` from `low attainment`.
- `Active classes` is ambiguous when recent activity is zero. If it means configured classes, rename it; if it means active in a time window, correct the calculation.
- No trend lines, date filters, cohort/benchmark comparison, minimum-sample warning, confidence interval, teacher/department filter, attendance/context, or explicit data freshness timestamp were visible.
- Misconception prevalence is shown visually without a numeric percentage.
- School scope is unclear for teachers connected to classes across multiple schools, and there is no distinct SLT role boundary: School Overview is available within the teacher session.
- CSV export initiation was exercised, but the in-app browser did not expose a download event. This is recorded as unverified compatibility rather than a confirmed product defect.

## Visual and interaction audit

### Strengths

- The cream/ember teacher palette and dark student palette are distinctive without feeling childish.
- Typography, borders, glows, tags, feedback colours, and card treatments are highly consistent.
- Hierarchy is strongest on the teacher command centre: recommended action first, evidence and drill-down second.
- Mobile student screens preserve legibility and tap-target spacing without overflow.
- Empty states generally explain what to do next.

### Refinements

- Reduce raw taxonomy codes on student-facing pages; always pair them with the plain-language misconception.
- Shorten explanations for live teaching and younger readers, with optional expansion for depth.
- Ensure every state change updates focus, `disabled`, `aria-selected`, and `aria-controls` consistently.
- Reset scroll on question/topic changes in Class Mode.
- Replace native prompt/confirm dependencies with product-owned dialogs that provide validation, cancellation, and accessible labelling.
- Distinguish `not started`, `not enough data`, and `zero performance`; several empty/zero states currently collapse these meanings.

## Content quality

Automated structural coverage is excellent: the current regression suite checked 7,731 MCQs. In the live Economics sample, however, the same implausible distractor—claiming that demand rises whenever price rises because the Veblen effect explains every good—recurred across unrelated inflation, RPI, hyperinflation, and demand-pull questions. Repetition makes the wrong option easy to recognise and weakens assessment validity.

Add qualitative sampling that detects repeated distractor text across a bank/subject, checks plausibility, confirms syllabus language, limits explanation length, and reviews reforge twins for conceptual rather than superficial variation.

## Analytics and observability

`POST /rest/v1/product_events` repeatedly returned 401 across student and teacher journeys (with one transient 502). Core actions usually succeeded, so analytics failure is being swallowed, but adoption data will be incomplete and the noise obscures real console failures.

**Fix:** use a narrowly scoped SECURITY DEFINER ingestion RPC or correct insert policy, validate event names/properties server-side, and monitor rejection rate. Keep analytics failure non-blocking but visible to operations.

## Automated verification

With the expected local staging harness running, `npm run check` passed:

- content-status contract current;
- 65 HTML pages built;
- explicit button-type check across 68 HTML sources;
- route smoke for 65 pages and 166 referenced local assets/links;
- 7,731 MCQ regression checks;
- four mocked auth-contract requests;
- API failure contracts for 503, quota rejection, and network failure;
- persistence recovery checks for visible failure state, both quiz modes, and quota guard.

The key gap is that these tests do not exercise the deployed Supabase policies and coded-student session lifecycle. Add an isolated, disposable end-to-end suite against a staging project covering teacher create → code generation → student join → Forge wrong/reforge → reload Anvil/Profile/Dashboard → Crucible → teacher reconciliation → deletion.

## Recommended remediation order

1. Fix Crucible coded-student persistence and never report a successful Anvil send before the write succeeds.
2. Fix coded-session propagation/readback for Anvil, Profile, and Dashboard.
3. Introduce assignment/session identifiers and one authoritative scoring definition.
4. Add deployed RLS integration tests for all three student surfaces and teacher reconciliation.
5. Resolve same-origin role collision with an explicit role/session switch or isolated student identity storage.
6. Fix next-unfinished-bank routing and answered-control accessibility.
7. Repair product-event ingestion and add rejection monitoring.
8. Add a real, auditable teacher class-deletion workflow.
9. Clarify SLT privacy, small-sample semantics, school scope, activity definitions, and data freshness.
10. Run qualitative content QA for repeated distractors and explanation/scaffold quality.

## Exit criteria for wider rollout

- Zero silent persistence failures in Forge, Anvil, or Crucible under coded access.
- Student and teacher assignment scores agree with an auditable response-level calculation.
- Anvil/Profile/Dashboard show the same saved history after reload and on another supported device.
- Disposable end-to-end staging test passes under real RLS policies.
- Teachers can delete a test class and all dependent data through the UI with confirmation and an audit trail.
- SLT metrics document definitions, time windows, sample thresholds, privacy treatment, and last-updated time.
