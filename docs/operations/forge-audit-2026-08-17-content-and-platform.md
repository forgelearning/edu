# Forge audit — 17 August 2026 (content bank + platform)

Companion to `forge-live-role-audit-2026-08-17.md`, produced independently in a
parallel session. The two audits were run against the same live Supabase project
on the same day and **independently reproduced the same P0 defects**, which is
worth treating as confirmation rather than duplication.

This document leads with what the other audit did *not* cover: a quantitative
analysis of the question bank, the root cause of the analytics failure, the
class-lifecycle permission gap, and a correction to the School Overview scoping
claim.

## Method

Live production Supabase (`crysulmbaadjkymcjrew`), `_site` served locally, all
three roles driven in a real browser. Student and teacher were isolated on
separate origins (`127.0.0.1` vs `localhost`) to sidestep the same-origin role
collision the companion audit describes.

Test data created and removed: one class (`LE-8AHU`), one student, three access
codes, one assignment, two responses, one analytics probe row. Post-cleanup
counts verified identical to pre-audit state: 27 classes, 93 students, 1216
responses, 7 assignments, 0 product_events.

Content figures come from evaluating `data/forge-data.js` after all rewrite
passes, i.e. what a student actually sees — 15,063 gradeable items (7,531 stems
+ 7,532 reforge twins).

---

## Part 1 — Confirmed P0s (independent reproduction)

### 1.1 Crucible silently discards every answer

`pages/app/crucible.html:463` writes with a raw anon `supaInsert('responses', …)`.
Reproduced directly:

```
POST /rest/v1/responses → 401
new row violates row-level security policy for table "responses"
```

`forge-quiz.html:178` correctly uses `ForgeStudentCode.recordResponse()` (the
code-scoped RPC). `crucible.html` and `anvil.html` were never migrated when
student access codes landed. The error is swallowed by `.catch(console.error)`.

**The Anvil's own repair sessions fail identically** — `anvil.html:438` uses the
same raw insert. So a student can complete a full repair session and nothing is
recorded. This means the Crucible's pre-run promise, *"Wrong answers go to your
Anvil automatically"*, is false twice over.

### 1.2 Coded students read back as zero — exact fix sites

The companion audit correctly identifies the symptom but describes it as a
fallback "not consistently retaining" the credential. The cause is narrower and
the fix is three lines.

`forge-quiz.html` persists `studentCode` into the `forge-student` localStorage
object on join. Three pages then rebuild a request anchor from that object and
**omit the field**:

| File | Line | Built anchor |
|---|---|---|
| `pages/app/anvil.html` | 651 | `{studentId, classCode, studentName}` |
| `pages/app/profile.html` | 708 | `{studentId, classCode, studentName}` |
| `pages/app/student-dashboard.html` | 491 | `{studentId, classCode, studentName}` |

`ForgeClasses.fetchLinkedResponses` (`scripts/forge-classes.js:240`) branches on
`anchor.studentCode`; without it, it calls the legacy
`get_student_own_responses`, which migration
`20260810133000_disable_legacy_student_rpc_on_coded_classes.sql` deliberately
disabled for coded classes. It returns `[]`, and `.catch(…) → done([])` makes the
failure indistinguishable from "answered nothing".

Measured in the live session:

```
anchor without studentCode → 0 rows
anchor with    studentCode → 2 rows   (the actual saved responses)
```

Fix: add `studentCode: saved.studentCode` at each of the three sites. Better,
make the missing-credential branch throw rather than silently degrade.

---

## Part 2 — New findings

### 2.1 Product analytics has never recorded a single event

`product_events` contains **0 rows**. Not "incomplete and noisy" — total loss
since launch, with consent granted.

Root cause is precise. `scripts/forge-product-analytics.js:52` sends:

```
Prefer: resolution=ignore-duplicates,return=minimal
```

`resolution=ignore-duplicates` makes PostgREST emit `ON CONFLICT DO NOTHING`,
which requires `SELECT` on the target table. `anon` and `authenticated` hold
`INSERT` only. Verified by differential probe against the live API:

| Prefer header | Result |
|---|---|
| `return=minimal` | **201 Created** |
| `resolution=ignore-duplicates,return=minimal` | **401** `permission denied for table product_events` |

Postgres' own hint in the response says it: `GRANT SELECT ON public.product_events TO anon`.

Two viable fixes: drop `resolution=ignore-duplicates` and rely on the
`client_event_id` primary key with a tolerated duplicate error, or move ingestion
behind a `SECURITY DEFINER` RPC. The latter is preferable — it also lets event
names be validated server-side.

This is also why `product-insights.html` sits permanently in "Local fallback
active".

### 2.2 Classes can never be deleted or renamed — and delete reports success

The companion audit notes there is no delete workflow in the UI. The gap is
deeper: **the database has no policy permitting it.**

```sql
select polname, polcmd from pg_policy where polrelid='public.classes'::regclass;
-- "Teachers can create their own classes"   a  (INSERT)
-- "Teachers can read their own classes"     r  (SELECT)
-- "Teachers can view own classes"           r  (SELECT, duplicate)
```

No `UPDATE`, no `DELETE`. Consequences:

- A teacher cannot fix a typo in a class name, ever.
- Adding a "Delete class" button would not work. I issued the exact request such
  a button would make, with a valid teacher token:
  `DELETE /rest/v1/classes?id=eq.… → 204 No Content` — and the row was still
  there. PostgREST returns 204 for a delete that matches zero rows, so the UI
  would show success and delete nothing. This is the same silent-failure shape as
  the Crucible bug.
- My audit class required service-role cleanup.

There are also two functionally identical SELECT policies, which is worth
tidying while in there.

### 2.3 School Overview: "school-wide" is actually key-stage-filtered

The companion audit states the overview "appears tied to one inferred school".
That is not what happens, and the real defect is different.

`get_school_overview()` keys on `lower(btrim(school))` and returns **all** of the
caller's schools. Measured:

```
RPC returns:  28 classes, 70 students, 1064 responses
              schools: ["mayfield grammar school", "mgsg", "zz audit school"]
Page displays: 25 classes, 61 students, "75% SCHOOL-WIDE ACCURACY"
```

The shortfall is the **A-Level / GCSE tab filter**. The KPI row recomputes from
the active tab while keeping the label "SCHOOL-WIDE ACCURACY". Switching to the
GCSE tab changes it to 76% / 3 classes / 9 enrolled.

So the single number an SLT lead would quote in a meeting is A-Level only, and
**there is no view that shows the whole school at all** (25 + 3 = 28).

Fix: either relabel to "A-Level accuracy" / "GCSE accuracy", or add an "All"
tab and make the KPI row unfiltered.

Separately, the underlying data *is* fragmented by free-text school names —
this teacher's 28 classes span `Mayfield Grammar School` (25),
`mayfield grammar school` (1), and `MGSG` (1). Case folding rescues the first
two; `MGSG` survives as a distinct school key only because it is the same
teacher. A second teacher typing `MGSG` would get a separate school. School
should be a normalised entity, not free text.

### 2.4 Question bank: the cue audit is one-directional

`dev/audit-banks.js` treats a correct answer that is the *longest* option as
fatal. Confirmed clean: **0 longest-answer cues across all 15,063 items.**

Nothing checks the inverse. Where the correct answer is uniquely the *shortest*
option and under 55% of mean distractor length:

| | Count | Rate |
|---|---|---|
| Stems | 150 | 2.0% |
| Reforge twins | 221 | 2.9% |

Worst subjects (stems): `gcse-geo` 7.6%, `gcse-science` 7.1%, `gcse-hist` 6.5%,
`gcse-maths` 5.3%, `bus` 4.5%.

The very first live question served in this audit was an instance
(`econ/ECON-1.1/TH1-DEM-11`): key `"Increase"` against three distractors that
each carry their own justification clause. Ratio 0.33.

I tested and **rejected** the hypothesis that the concise-override tables caused
this: only 27 of the 371 flagged items have an override entry (3.3% of
override-covered items vs ~2.5% baseline). It is in the source literals.

Incidentally, those override tables now hold **822** `"<id>:base"` /
`"<id>:reforge"` keys — `CLAUDE.md` describes "~430" in one place and "~313" in
another. Both are stale.

### 2.5 Content-free "null option" distractors — 12% of the bank

A distractor a student can eliminate without knowing any subject content
("It has no significant relevance to the topic being tested").

**1,807 of 15,063 items (12.0%)** contain at least one. Concentration is extreme:

| Subject | Source questions affected | Items |
|---|---|---|
| `crim` | **200 / 200 (100%)** | 399/400 |
| `pol` | **200 / 200 (100%)** | 395/400 |
| `law` | **200 / 200 (100%)** | 385/400 |
| `geo` | 148 / 238 (62%) | 266/474 |
| `hist` | 170 / 212 (80%) | 211/424 |
| `soc` | 143 / 200 (72%) | 143/396 |

Two strings alone account for most of it: `"It has no significant relevance to
the topic being tested"` (365 questions, shared across Law *and* Politics) and
`"It cannot be applied to a problem or evaluation question"` (362).

Every Criminology, Politics and Law question is therefore effectively a
three-option question. Guess rate rises from 25% to 33%, and reported accuracy in
those subjects is inflated accordingly — Criminology currently shows 96% on the
School Overview.

Corroborated by two independent methods (phrase match, and duplicate-distractor
frequency analysis).

### 2.6 Off-topic boilerplate contaminating A-Level Economics

**211 distinct Economics questions across 18 of its 19 banks** carry a
micro-economics distractor pasted into an unrelated macro question. Two strings:

- `"Demand rises whenever price rises, because the Veblen effect explains every good a household chooses to buy."` — 211 items
- `"A fall in electric-car production costs, which shifts supply rather than demand."` — 85 items

Live example, `econ/GRO-01` — a question about GDP *level* versus *rate*:

```
A  The student is describing the level of GDP, not the rate of growth   ← correct
B  The student should have used nominal GDP, not real GDP.
C  Demand rises whenever price rises, because the Veblen effect …       ← non-sequitur
D  Growth can only be measured using GDP per capita.
```

Its reforge twin, comparing two countries' growth rates, offers
`"A fall in electric-car production costs…"` as option D.

Worst-hit banks: `4.1.1` (119 items), `3.1.1` (50), `3.2.1` (34) — i.e. Themes 3
and 4, the macro content. This matches the signature of a repair script matched
against the wrong bank, the exact failure mode `CLAUDE.md` records as fixed.

The companion audit logged this as P2 "repeated implausible distractor"; the
scale is larger than a sample would suggest, and it sits in the flagship subject.

### 2.7 Distractor padding is still running, at scale

Authoring standard #1 in `CLAUDE.md` says to write distractors at comparable
length *rather than padding them afterwards*. Four tables do exactly the padding:

| Table | Entries | Lengthened | Pure append |
|---|---|---|---|
| `geoOptionRepairs` | 5 | 5 | 0 |
| `separateScienceOptionRepairs` | 45 | 42 | 0 |
| `geoAlevelDistractorRepairs` | 187 | 187 | 4 |
| `econAlevelDistractorRepairs` | 129 | 129 | 121 |

**366 rewrites, 100% of which lengthen the distractor.** The padding frequently
makes the wrong option obviously wrong, which defeats the purpose:

- `SD-08`: `"The government controls all house building."` → `"…, issuing every permit and directly constructing every new home itself."` (implausible strawman)
- `TH1-PPC-10`: `"A movement from unemployment to work"` → `"…, which shifts the whole economy from inside the frontier out onto a new, higher curve"` (appends correct economics onto a wrong option)
- `SD-06`: appends `"…since examiners mark only the position and slope of the curves drawn"` (invents an exam-board claim)

The length audit passes; the assessment quality does not.

### 2.8 Smaller content defects

- **Truncated correct answer.** `econ/ECON-1.1/SD-08` option D (the key) reads
  `"Supply of housing is constrained by planning permission, construction time"`
  — no conjunction, no final item, no full stop. In the source literal at
  `data/forge-data.js:1372`, not an override.
- **88 options with lower-cased proper nouns**, e.g.
  `"It had no meaningful effect on britain 1906–1918"` across the `hist` banks.
- **Wrong subject subtitle.** `data/forge-data.js:13203` sets
  `SUBJECTS["econ"].sub = "Edexcel 9EC0 — Themes 2, 3 & 4"`, but the bank list
  begins with `ECON-1.1` (Theme 1) and the quiz serves it. Shown on the quiz
  header and in Class Mode.
- **Three different question counts for one subject.** Class Mode says A Level
  Economics has 536 questions; the Crucible says 519; `audit-banks.js` counts 519
  gradeable stems.
- **Raw taxonomy codes shown to students** (`MC-MICRO-XED` on the feedback card).

---

## Part 3 — Smaller platform issues

- **Native dialogs in a Capacitor app.** `Generate student codes` uses
  `window.prompt`, then `window.alert`, then a blob `link.click()` download. All
  three are unreliable-to-broken in iOS/Android WKWebView shells, and this repo
  ships Capacitor targets. The underlying RPC is fine (1.0s, returns correct
  codes) — only the delivery mechanism is wrong.
- **No scroll management on view change.** Clicking `+ Create a class` below 27
  class cards swaps the view but leaves the page scrolled to the bottom, so the
  click looks like it did nothing. Same after class creation (the code, copy
  buttons and `Open dashboard →` land below the fold) and after `Re-forge →` in
  the quiz.
- **Class creation takes 5–10s** against a 10s client timeout in
  `ForgeAPI.request`. A slow-network teacher will get "check your connection" on
  a class that was in fact created.
- **Document title lags the view.** Creating a class and opening its dashboard
  leaves the title as "Forge — Your classes", despite the code comment at
  `teacher.html:180` describing exactly this bug.
- **Grammar.** `1 students · 2 answers` on the class dashboard (the line above it
  correctly says `1 student`).
- **Duplicated success copy.** After creating a class: a green banner
  "Class created / Your class code is ready to share" immediately above a panel
  headed "Class created ✓".
- **Two vocabularies for the same features.** Bottom nav says
  Home / Practice / Assigned / Repair; the page content says Forge / Anvil /
  Crucible. Crucible has no bottom-nav entry.
- **Student dashboard copy is stale**: "Enter your name and class code to see
  your progress" above three fields, one of which is the student code.
- **`0%` shown in red for a student with no data** on the Profile, where the
  teacher dashboard correctly shows `—`.
- **`NEEDS ATTENTION TODAY TOP MISCONCEPTION VOLUME`** renders as two labels run
  together with no separator.

## What is genuinely good

Worth stating plainly, because the defect list is long and the product is not bad.

- **The teacher command centre is the strongest thing here.** "Next best action"
  first, evidence second, drill-down third. It resolves `MC-MICRO-XED` into
  *"Cross elasticity sign not linked to substitutes or complements"*, ranks by
  frequency, names the student to start with, and links a ready-made corrective
  starter. Very little edtech gets this far past decorative charts.
- **The wrong-answer → scaffold → reforge-twin loop is well executed** in the
  quiz, and it does persist correctly (`reforge_attempted`/`reforge_correct` land
  as expected).
- **Assignment progress deliberately excludes responses recorded before the
  assignment was created**, with the reasoning documented in code. That is a
  subtle correctness decision made well.
- **Access-code join is genuinely frictionless** — no passwords, no email, and
  the code is treated as a credential rather than a display label.
- **Consent Mode v2 is implemented properly**: `analytics_storage` denied by
  default, ad storage always denied, non-modal inline banner.
- **Empty states mostly tell you what to do next**, and the SLT overview's
  "2 active in 7 days" is the honest number most dashboards would bury.
- Visual system is consistent and distinctive; zero broken internal links across
  65 pages.

## Suggested order (merging with the companion audit)

The companion audit's remediation list stands. I would insert:

1. **Before its item 7** — fix `product_events` ingestion by dropping
   `resolution=ignore-duplicates`. It is a one-line change that restores all
   adoption telemetry.
2. **Alongside its item 8** — add `UPDATE`/`DELETE` policies on `classes` *first*,
   and make the client treat a `204` with zero affected rows as a failure.
3. **New, before content work** — extend `dev/audit-banks.js` with three checks:
   shortest-answer cue, distractor text reused across unrelated questions in the
   same subject, and content-free option phrases. All three are cheap and would
   have caught §2.4–2.6 automatically.
4. **New** — retire the four distractor-lengthening tables and rewrite those 366
   distractors as plausible alternatives.

Criminology, Politics and Law should not be marketed as exam-ready until §2.5 is
addressed; at 100% null-option coverage their reported accuracy figures are not
meaningful.
