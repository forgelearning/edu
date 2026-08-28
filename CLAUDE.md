# Forge — working notes

Static site. All question-bank content lives in one file: `data/forge-data.js`,
which defines `BANKS` (the questions) and `SUBJECTS` (which banks each subject
card shows). The app pages read it directly, so a syntax error or a bad key
there breaks every subject at once, not just the one being edited.

## Before you commit a bank change

```bash
node dev/audit-banks.js              # everything
node dev/audit-banks.js econ 2.1.1   # a subject key or a bank id
```

It exits non-zero on anything that breaks a question for a student
(ungradeable key, malformed options, duplicate id, missing bank).

## Authoring standard for new questions

Applied in full to `psych` and to Economics Theme 2. Older banks predate it.

1. **The correct answer must never be the single longest option.** Students
   score above chance by picking the longest one. Write distractors at
   comparable length rather than padding them afterwards — parenthetical
   filler like `(all else equal)` reads as exam text to a student and, when it
   lands on the correct answer, creates the very cue it was meant to remove.
2. **Balance answer keys within each bank**, roughly 25% per letter.
3. **Apply both rules to the Reforge twin as well.** This is the one that gets
   missed. The twin is what a student sees straight after getting something
   wrong, so a giveaway there matters at least as much. Before this was
   checked, Reforge keys across the A-Level banks were 63% "B", and several
   subjects were 100% "B".
4. **Assign the answer letter when you write the question.** Do not write the
   options first and permute them afterwards with a script — a regex that
   matches across question boundaries will silently point a key at the wrong
   option, which the structural audit cannot detect. If you do reorder, print
   every correct answer and read them before committing.
5. Every multiple-choice question needs a `scaffold` that teaches, and a
   `reforge` twin testing the same idea from a different angle.

Question shapes in use: standard multiple choice; `type: "fill_blank"`
(`template` with `___` gaps, `blanks`, and a `bank` of options);
`type: "short_answer"` (`model_answer`); `type: "extended_answer"`
(`model_answer_outline`). The last three have no `correct` field — that is
expected, not a defect.

## Two invariants added on 2026-08-21 — don't undo them by accident

**A class's school is server-derived, not typed.** `classes.school` and
`school_key` are filled by a `before insert` trigger from the teacher's row in
`teacher_profiles`, and the insert is refused outright when that row is missing.
The only way to get one is `claim_teacher_invite(code)`, and invite codes now
carry the school they admit you to. So: don't add a school field back to the
create-class form, and don't scope anything by the typed string — the overview
scopes by the profile. Sign-up itself is still open (blocking it needs an auth
hook this plan doesn't have), but an unclaimed account cannot create a class and
`get_school_overview` answers `no_school`.

**`ECON100_SCAFFOLDS` must stay complete.** The four generated Economics banks
(`ECON-1.1`, `3.1.1`, `3.2.1`, `4.1.1`) build two questions per concept from a
factory. Its scaffolds used to be templates built from the answer — "Use the
definition of X... <answer> gives the relevant economic conclusion" — which
restated the answer instead of teaching it, across 150 questions. Each of the 86
concepts now has a hand-written scaffold keyed by topic, shared by both
questions in the pair. A concept added to those tables without an entry silently
falls back to the old template, so add the scaffold at the same time.

## Concurrent sessions — read this

More than one session often has this repo open, and `data/forge-data.js` is the
common target.

- **Do not `git add -A`.** It sweeps up whatever another session has open and
  commits it under your message. This has already happened repeatedly. Stage
  the specific files you changed.
- Re-read the file immediately before appending; another session may have
  committed since you last looked.
- If you must isolate your own work from a shared dirty tree: rebuild
  `HEAD + your changes` in the file, `git add` that one path, commit, then
  restore the full working copy so the other session keeps its edits.

## Current ownership — A-Level Economics (Edexcel 9EC0)

| Area | Questions per bank |
|---|---|
| Theme 1 (`ECON-1.1`) | 100 |
| Theme 2 — 2.1.x, 2.2.x | 20 each |
| Theme 2 — 2.3.x | 12 each |
| Theme 2 — 2.4.x, 2.5.x | 7-10 each |
| Themes 3 and 4 (`3.1.1`, `3.2.1`) | 50 each |
| Theme 4 (`4.1.1`) | 100 |

Theme 2's 2.4 and 2.5 banks are the thinnest and are the next ones to extend.

## Answer text is rewritten after the literals — check the override tables

Several tables near the end of `data/forge-data.js` (`geo640ShortAnswers`,
`gcseHistoryConciseAnswers`, and the `gcseScience*Concise*` family) overwrite
`item.options[item.correct]` with a shorter string, keyed by `"<id>:base"` or
`"<id>:reforge"`. There are ~430 such entries. The intent is sound — stop the
correct option reading like a mini mark scheme — but a bad entry silently
replaces a correct answer with a fragment, a circular phrase, or a different
fact, and the question still looks perfectly well-formed.

This is not theoretical: entries had turned "Salt, water and carbon dioxide"
into "Hydrogen", "Evaporation or crystallisation" into "Chromatography", and
"Energy is transferred, not created or destroyed" into "Thermal store".

So: **when a correct answer looks wrong, check these tables before the question
literal** — the literal is often right and the override is the bug. To see what
a question originally said, evaluate the file with
`if (concise) item.options[item.correct] = concise;` stripped out and diff the
correct-answer text. Length balancing does *not* depend on these tables;
`equaliseGeneratedOptions()` in the rebalance pass handles it, and the audit
reports 0% cued without them.

A full audit on 2026-08-10 diffed all ~313 entries across these five tables
against the pre-override literal and found one more live instance of this bug:
`SCI-CHEM2-13`'s Reforge twin had its correct answer rewritten from
"One-positive ions" to "One-negative ion" — a real factual flip (Group 1
metals form +1 cations), not a paraphrase. Fixed. Re-run this diff before
trusting the tables are clean; a one-off audit doesn't prove the next edit
won't reintroduce the same class of bug.

Two other passes rewrite questions after the literals, worth knowing for the
same reason: `rebalanceMCQSubject()` swaps option *letters* (so always match a
key on answer text, never on letter), and `expandSubjectToMinimum()` clones
existing questions to pad a subject to 200, so an error in a source question
propagates into its `*-COV-*` copies and fixing the source fixes them all.

## Current status after PR #133

- The full bank now has **0 longest-answer cues** across 7,531 stems and 7,531 Reforge twins. `dev/audit-banks.js` treats any future `CUE` as fatal.

  **Read that number carefully.** It is true of what a student sees, and it is
  produced almost entirely by a runtime patch rather than by authoring. Remove
  the anti-cue loop and **1,410 of 15,327 items (9.2%)** have the correct
  answer as the single longest option — `gcse-hist` 34.8%, `bus` 31.6%, `gcse-psych` 28.7%,
  `bus` 32.6%, `cs` 26.7%, `econ` 26.1%. (Both the total and the per-subject
  shares re-measured 2026-08-28 with `dev/audit-source-cues.js`, after the
  separate-science, law, rs, maths and hist keys were rewritten. `law`, `rs`,
  `maths` and `hist` no longer appear in the ranking at all. The previous
  figure here was 2,430 / 16.1% naming `gcse-econ` 61.2% as the worst subject;
  `gcse-econ`, `gcse-geo` and `geo` are all at **0** now. Other sessions cleared
  them without updating this file, which is the recurring failure mode — always
  re-measure.)

  Two tools read this, both loading the bank with and without the loop via
  `dev/lib/source-bank.js`:

  - `node dev/audit-source-cues.js` — diagnostic. Reports the split by subject
    and never fails a build. Use it to understand the shape of the backlog.
  - `node dev/check-source-cues.js` — the gate, in `npm run check` and CI.
    Ratchets the total against `SOURCE_CUE_BASELINE` so the backlog cannot
    grow. Pass a bank id or subject key (`node dev/check-source-cues.js
    GCSE-GEO-URB`) to list the offending ids while authoring; filtered runs
    never fail, since a partial run cannot see the pinned total.

  **`dev/audit-banks.js` cannot catch a newly cued question**, which is why the
  gate above exists. The audit measures the post-loop bank, so a fresh batch
  where the key is the giveaway every time passes it cleanly — that is exactly
  what happened to the first draft of the Year 10 GCSE Geography extension
  (12 of 12 cued, `npm run check` green). Writing a nuanced correct answer
  against blunt distractors is the natural way to write a question, so expect
  to trip this and fix it by lengthening a distractor, never by padding the key.

  So the loop is load-bearing, not a tidy-up. Breaking it would instantly cue
  roughly a tenth of the bank. Fixing the source questions is what would let it be
  deleted — and it is also the only way to fix the recycling it causes, since
  a loop that must find a distractor longer than the key has to take one from
  somewhere.

## Three content-quality ratchets (added 2026-08-17)

`dev/audit-banks.js` now also checks three ways a question can be answered
without knowing the subject. A structurally perfect bank can fail all three, so
nothing else in the suite could see them. Each follows the
`PERMUTED_REFORGE_BASELINE` convention: fail on regression, and tell you to
lower the baseline when a fix lands. They live in `CONTENT_BASELINES`.

| Check | Baseline | Meaning |
|---|---|---|
| `NULL OPTION` | **0 — never raise** | A content-free dismissal ("It has no significant relevance to the topic being tested"). Makes a 4-option question a 3-option one, so guessing pays 33% and reported accuracy inflates. |
| `SHORT CUE` | 298 | The correct answer is uniquely the shortest *and* under 55% of mean distractor length. The mirror of `CUE`. |
| `RECYCLED DISTRACTOR` | 1 | One distractor string used in more than 8 distinct source questions. Coverage clones are excluded via the `coverageVariant` flag — an earlier version stripped a `-COV-n` suffix instead, which turned `MAND-COV-011` into `MAND` and collapsed all 80 Mandarin clones into one pseudo-question. |

The audit prints the true count of each next to its baseline. Only the first
ten of each are listed, so **never count the printed lines** — that reads as a
26x improvement when nothing has changed.

### The anti-cue loop is now the only source of recycling

The redistribution pass at the end of `data/forge-data.js` cleared the authored
half (42 entries down to 1, measured 2026-08-22). It applies the same fix this
section describes for the anti-cue loop — take the **least-used** candidate, not
the first — to the generation passes that rebuilt Reforge option sets from a
shared pool. First-match there had put "Thought cannot be studied" in 25 GCSE
Psychology questions. It only ever swaps in a string already authored as a
distractor in the same bank (then the same subject), and refuses any swap that
would duplicate an option, collide with the key, cue the answer by length, or
leave a Reforge set identical to its base set. It runs last because earlier
passes rebuild Reforge twins and would overwrite it.

### The anti-cue loop was the biggest single source of recycling

The loop near the end of `data/forge-data.js` that removes longest-answer cues
works by swapping the longest distractor for an *already-authored* one that is
longer than the key. It used `.find()` over a subject-wide pool, so the first
long-enough entry won — and won for every question reaching the fallback. In
A-Level Economics the pool starts at `ECON-1.1/SD-01`, so that one question's
two distractors were sprayed across **211 and 85** unrelated questions (a
Veblen-effect option offered in macro questions about GDP growth). The code
already carried a comment about the same thing happening to A-Level Business.

Now tiered tag → same bank → subject, picking the **least-used** candidate
rather than the first. That took the Veblen string from 211 questions to 2 and
`RECYCLED DISTRACTOR` from 73 to 46 (44 as of 2026-08-21), with `CUE` still 0.

It is not a full fix. The strategy itself is wrong: any loop that must find a
distractor *longer than the key* will eventually reach outside the topic, so
`2.2.2/AS-08` can still end up offering "Price (£ or P) on the vertical axis…"
in a question about VAT and SRAS. The real fix is authoring distractors of
comparable length in the source, which is what the `SHORT CUE` backlog is.

`SHORT CUE` is the reason these exist. It is not a static backlog: it drifted
from 371 to 394 **during** the hand-fixing of the null-option problem, unseen,
because nothing was watching. Pin a check before starting a content fix, not
after.

Before treating either as hand-authoring, check whether the anti-cue loop
caused it — `node dev/audit-source-cues.js` loads the bank with and without
that loop. Re-measured on 2026-08-21 by running `dev/audit-banks.js` against a
copy of the bank with the loop stripped out:

| Backlog | Created by the loop | Authored in source |
|---|---|---|
| `SHORT CUE` (298, was 392 on 2026-08-21) | **1** | **297** |
| `RECYCLED DISTRACTOR` (1) | **1** | **0** |

So `SHORT CUE` really is a hand-authoring backlog — that was worth checking and
the obvious hypothesis (that the loop shortened keys relative to swapped-in long
distractors) is wrong.

The recycling backlog is now the other way round: the authored half is cleared
(see the redistribution pass at the end of `data/forge-data.js`) and the single
remaining entry is one the anti-cue loop creates. It cannot be swapped out
without making the correct answer the longest option — `2.5.2/BNK-08` keeps a
182-character distractor against a 139-character key purely to out-length it —
so it will only fall when that key is rewritten. That is `SHORT CUE`/`CUE`
work, not recycling work.

**And check whether the subject is even a candidate for hand-authoring.** The
`SHORT CUE` backlog is now concentrated in `mand` (45), `gcse-science` (34),
`gcse-hist` (25), `econ` (10) and `gcse-psych` (9); `gcse-geo` is at 0. But
Mandarin's 45 are not authoring debt at all:

- Its coverage clones carry generated long distractors that belong to other
  questions (a sentence about spending too long on social media, offered in a
  restaurant grammar question). **0 source questions and 12 clones** hold that
  string, so there is no parent to correct — it is produced during cloning.
- Those long options drag the mean distractor length up, which is what pushes
  the ratio under 0.55. The correct answers are fine: a one-character particle
  is the right answer to a one-character gap-fill, and character counts are not
  comparable between a Chinese particle and an injected sentence.

Rewriting 45 Mandarin keys would make the questions worse and the metric
better. Confirm a subject's short cues are real before spending effort on them.

**`compactGeoCorrectOption` no longer fires on any question (2026-08-28).**
That pass cut down any gcse-geo correct answer that was the uniquely longest
option, and the cut landed mid-clause. Students were being shown
"and less effective warning systems" as the answer to an earthquake-impact
question, "enterprise zone region specifically set up government encourage" as
a definition, a bare "International" as the effect shaping Brick Lane, and
"moving the solid lithosphere above" as the definition of the asthenosphere.
Each was a good full sentence in the literal.

All 14 banks have now been rewritten so that every key is authored short enough
that the pass never fires: **433 mangled keys down to 0**, verified by loading
the bank with and without the pass (`dev/lib/source-bank.js` does the same trick
for the anti-cue loop). `gcse-geo` is at 0 audit issues, and the subject's
`SHORT CUE` count went 84 → 0 as a by-product.

Three consequences worth knowing:

- **`compactGeoCorrectOption` and `geoConciseCorrectOverrides` are deleted**,
  along with `geoOptionRepairs` and the loop beneath it that appended
  `" in this context"` to a gcse-geo distractor whenever it was not longer than
  the key. That padding loop still fired 98 times, but every string it produced
  was overwritten by a later pass: deleting all of it left the rendered bank
  byte-identical across all 15,327 options, with `CUE` 0, `SHORT CUE` 308 and
  the source-cue total unchanged. Keep gcse-geo keys no longer than their
  distractors and nothing needs to grow back.
  **The six padding loops elsewhere in the file are gone too.** They sat inside
  the separate-science repair pass and the five `rebalance*` helpers (which
  still permute the answer letter — only the padding was removed). Between them
  they appended `" in this context"` 239 times per load, and not one of those
  strings survived to the rendered bank: deleting all six left every option
  byte-identical, checked by evaluating the file before and after and diffing
  all 15,756 option sets. `grep 'in this context";'` now returns nothing, so the
  padding bug can no longer come back on its own.
- **Five keys had been surviving by a three-table round trip** — cut by the
  compaction pass, restored by `geoOptionRepairs`, then protected from `CUE` by
  a deliberately inflated distractor in the repair table near the end of the
  file (a 157-character option existing only to out-length a 117-character
  key). Those five are now authored short, their `geoOptionRepairs` entries
  deleted, and the padded distractors cut back to sensible length.
- **The `SHORT CUE` ratchet was never a good measure of this bug.** It only
  catches a fragment that *also* ends up much shorter than its distractors.
  `GCSE-GEO-HAZ` sat at 0 short cues with 40 mangled keys. Measure compaction
  directly — compare the bank loaded with and without the pass — rather than
  trusting the ratchet.

Where a key was correctly terse ("Methane from livestock", "Traction",
"A spit", "Census data") the fix was to shorten the distractors instead, never
to pad the key.

**The separate sciences had the identical pass, and it is also gone
(2026-08-28).** `compactSeparateScienceOption` cut any `gcse-sep-*` key that
was the uniquely longest option, so students were shown "Gravitational" as the
energy store gained when lifting an object, "Current entering equals" as what
happens at a junction, "It creates changing" for why a transformer needs AC,
and "Number complete waves per" as the definition of frequency.

`separateScienceOptionRepairs` had hand-restored 45 of them, one entry per
question — which is exactly why the damage was invisible: those 45 looked fine
while **298 others stayed broken**, and Chemistry measured clean because its
share happened to be covered. Do not read a repair table as evidence a pass is
harmless.

Fixed at source: 48 source questions carried the whole thing (the other 250
were `-COV-` clones that inherit, so fixing the parent fixed them all). Nearly
every key here was already a correct, minimal definition — "Cell membrane",
"Potential difference", "Carbon dioxide" — so the fix was almost always to
lengthen a distractor, not to shorten the key. Both the pass and all 45 repair
entries are deleted; the rendered bank changed on only one question, the one
whose repair entry was still restoring a long key.

For the genuinely authored half: each entry needs a plausible replacement
written for that specific question. Do **not** clear them with a bulk rewrite
script; that is what produced the padding passes and the Veblen contamination in
the first place. Rewriting just ten null options by hand still introduced three
near-duplicate option pairs that only a manual read caught.

Considered and rejected: a token-similarity check for near-duplicate options.
It flags 420 pairs, but most are legitimate — `"Output rises, price level
rises"` vs `"Output rises, price level unchanged"` is a good option set, and MFL
conjugation options necessarily share tokens. It would be noise.
- The HSC and RS taxonomy residues are resolved: all active tags have concept labels, and RS now has 16 explicit starter activities. The audit currently reports 0 issues.
- The paragraphs below retain historical context about how the taxonomy and cue backlogs were found. Re-measure the live checkout before treating any historical count or backlog ordering as current.

## Current status after the 2026-08-10 full audit

A session-long audit (structural checks, the full `npm run check` gate, a
diff of every override-table rewrite against its pre-override literal, live
browser QA against the staging harness, and a manual scaffold-quality read
of GCSE History/Psychology) found the paragraphs below were badly stale —
several backlogs they describe as open were already finished, most likely by
other concurrent sessions that didn't update this file. What the audit
actually found and fixed:

- **The misconception-tagging backlog is done.** Every subject this file
  used to list as "untouched" (`chem`, `bio`, `phys`, `rs`, `hsc`, `media`,
  `french`, `span`, `german`, `pe`, `englit`, `engll`, `mand`, `bus`, `cs`,
  `maths`) is at `0` in both `TAG_TAXONOMY_SUBJECTS` and
  `TAG_TAXONOMY_MECHANICAL` in `dev/audit-banks.js` right now. Re-read those
  two maps directly rather than trusting the narrative below — it describes
  how the backlog was worked through, not its current state.
- **The distractor-padding filler bug is fixed**, and was far smaller than
  described below by the time of this audit: 41 options with a duplicated
  closing clause (a repair pass had run twice), 12 options reusing an
  identical boilerplate closing sentence as their only distinguishing
  content, and — found while fixing those — 23 GCSE History/Business
  distractors with a completely unrelated science-repair sentence glued onto
  the end (`"It focused only on foreign policy The science explanation must
  account for the particles, forces, energy..."`), from a repair script that
  matched the wrong subject. All fixed via question-scoped repair tables
  applied last in the file. `dev/audit-banks.js` reports 0 issues.
- **GCSE Psychology's scaffolds were already clean**; **GCSE History's were
  not** — all 96 questions across its four banks carried a placeholder
  scaffold (`"This tests the specified <bank-id> knowledge point: <answer>"`)
  instead of an explanation. Replaced with genuine content.
  `dev/check-gcse-scaffolds.js` reports 0 placeholder-style.
- `dev/test-forge.js`/CI gap: `.github/workflows/pages.yml` didn't run
  `dev/test-forge.js`, `dev/test-auth.js`, `dev/test-forge-api.js`,
  `dev/test-persistence.js`, or `dev/audit-supabase-security.js` — only local
  `npm run check` did. That's how a broken `forge-auth.js` path (from the
  page-reorg PR) shipped to `main` unnoticed. Fixed; CI now runs all five.

**Lesson for the next session**: re-measure before trusting any "done" or
"backlog" claim in this file, including the ones just added above — that is
the recurring failure mode this audit kept finding.

## Historical notes and current outstanding issues

**Superseded by "Current status after the 2026-08-10 full audit" above** —
the misconception-tagging backlog, GCSE History's scaffolds, and the filler
bug this section describes as open are all now fixed. Kept below only for
whatever genuinely-still-useful mechanics it documents (how
`TAG_TAXONOMY_SUBJECTS` counts array tags, why `englit`/`engll` share banks,
etc.) — treat every completion claim in it as stale by default.

- Reforge option sets are currently distinct across every MCQ; keep
  `dev/test-forge.js` running as new content lands.
- Misconception labels and starter activities remain a product-quality backlog:
  the teacher heatmap should show human-readable labels and useful intervention
  suggestions for every active tag. The blocker is *tagging*, not starters —
  most subjects give each question a tag unique to itself (`tag === "MC-" + id`),
  so nothing aggregates and every starter falls back to a generic drill.

  **Measure before trusting any "done" list here, including this one.** The
  honest record of completion is the ratchet in `TAG_TAXONOMY_SUBJECTS` in
  `dev/audit-banks.js`: it caps the share of a subject's questions allowed to
  sit on a tag used only once. A high value means the entry was set to whatever
  the state already was and mostly locks in the status quo.

  **A `0` there does not by itself mean retagged.** `expandSubjectToMinimum()`
  clones a question to pad a subject to 200 and the clone inherits its source's
  tag, so a purely mechanical `MC-<id>` tag gets paired up by its own clone and
  scores a perfect `0`. `cs` is the live example: single-use share `0.00`, and
  92 of its 112 source questions tagged `MC-<id>`. Read `0` together with
  `TAG_TAXONOMY_MECHANICAL`, the companion ratchet that measures the share of
  SOURCE questions whose tag names no concept. Both must be low.

  That second ratchet asks whether a tag contains a concept word at all, not
  merely whether it equals `MC-<id>` — an all-caps code ending in a number
  does not. `MC-<id>` was too literal a test and missed a whole subject: see
  `gcse-geo` below. An index tag still passes when it groups two or more
  distinct source questions, which is econ's `MC-AD-03` — numeric, but shared,
  labelled and starter-backed. `fill_blank` restatements are excluded from
  that count for the same reason coverage variants are: they restate their
  source question and inherit its tag, so they pair a tag up without grouping
  anything.

  Note what this does *not* mean: one topical tag per source concept, reused
  across that concept's coverage variants, is the design working. `gcse-maths`
  (`MC-MATH-RATIO`) and the `gcse-sep-*` sciences (`MC-SEP-BIO-OSMOSIS`) are
  built that way and are genuinely done — 0% mechanical tags in all four.

  Fully done: `gcse-econ` (420 questions onto 76 shared
  `MC-GE-*` tags), the three `gcse-sep-*` sciences (600 questions on 96 shared
  topic tags), `gcse-science` (212 questions from 156 tags onto 83, reusing the
  `MC-SEP-*` set — see `docs/misconceptions/gcse/gcse-science-misconception-mapping.md`),
  `gcse-maths` (126 tags onto 90; all 90 labelled, 89 with a hand-written
  starter — its tags were already topical and merely split by a numeric
  suffix, so the work was merging variants, not designing a taxonomy),
  `hist` (37 shared `MC-HIST-*` tags, see
  `docs/misconceptions/a-level/history-misconception-mapping.md`), `soc` (185 questions onto 44
  categories) and `geo` (all 238 questions onto 52 categories, none carrying
  fewer than two, with 52 hand-written starters — see
  `docs/misconceptions/a-level/geo-misconception-mapping.md`). Substantially done: `psych` (0.18).
  `gcse-geo` (640 questions; 34/640 single-use = 0.053 and 0% mechanical
  tags after all 14 banks were hand-curated; see the bank mapping docs), and
  `econ` (515 questions onto 187 labelled taxonomy tags; 6/515 single-use =
  0.012 and 0 mechanical after stage 2; see
  `docs/misconceptions/a-level/econ-misconception-taxonomy-draft.md`). `gcse-geo` is now fully
  curated: its subject ratchets are 0.06 single-use and 0 mechanical, with
  labels and corrective starters for every shared taxonomy tag. `econ` is
  likewise complete apart from six genuine singleton concepts, each with an
  explicit starter.
  `gcse-psych` (202 questions onto 53 shared `MC-GPSY-*` categories, 0
  single-use and 0 mechanical; see
  `docs/misconceptions/gcse/gcse-psych-misconception-mapping.md`).
  `crim` (200 questions onto 30 shared `MC-GCRIM-*` categories, 0 single-use
  and 0 mechanical; see `docs/misconceptions/gcse/gcse-crim-misconception-mapping.md`).
  `law` (200 questions onto 22 shared `MC-GLAW-*` categories, 0 single-use
  and 0 mechanical; see `docs/misconceptions/a-level/law-misconception-mapping.md`).
  `pol` (200 questions onto 28 shared `MC-GPOL-*` categories, 0 single-use
  and 0 mechanical; see `docs/misconceptions/a-level/politics-misconception-mapping.md`).
  `gcse-hist` (200 questions onto 29 shared `MC-GHIST-*` categories, 0
  single-use and 0 mechanical; see `docs/misconceptions/gcse/gcse-hist-misconception-mapping.md`).

  Next, roughly by value: the ~15 subjects still at 100% per-question tags.
  The audit fails
  if a subject listed in `TAG_TAXONOMY_SUBJECTS` regresses, if it exceeds its
  `TAG_TAXONOMY_MECHANICAL` share, or if an aggregatable tag has no starter;
  add a subject to both maps once it is retagged.

  Ranked by mechanical-tag share, the untouched backlog is: `chem` `bio` `phys`
  `rs` `hsc` `media` `french` `span` `pe` `englit`
  `engll` and `mand` all at 1.00,
  `bus` 0.99, `cs` 0.89, `maths` 0.63.

  **`gcse-geo` is now fully curated.** The earlier note saying its tags
  "already name topics" was wrong: all 14 banks now use hand-reviewed,
  question-id mappings grouped by underlying error, with coverage twins
  retaining one key. Its remaining singleton concepts are genuine residual
  categories rather than per-question slugs.
  mechanical check now catches all of this — see below.

  **A label and a starter existing does not mean a subject is done, either.**
  A-Level `geo` looked part-finished because `GEO-TEC` and `GEO-COAST` carried
  16 + 6 tags that all had labels and hand-written starters. Those tags belong
  to `gcse-geo`, which still uses them, and A-Level geo was sharing them
  wrongly: A-Level `COAST-02` asks what causes longshore drift and pointed at a
  starter reteaching headland-and-bay formation. Check that a tag's label
  describes the question in *this* subject before counting it as covered.
- Not every subject needs a fresh taxonomy first: `gcse-sep-*` already carried
  good topic tags, so the work there was purely labels and starters. Check what
  a subject's tags actually look like before assuming a retag is needed.
- A-Level Geography is intentionally marked Developing until every active route
  point is mapped. That is about spec-point coverage (91%) and is unrelated to
  its misconception tagging, which is complete.
- **A second boilerplate filler is also gone (2026-08-28).** Separate from the
  `" in this context"` padding, three repair tables (`staticLegacyRepairs`,
  `finalLengthCueRepairs`, `finalMediaCorruptionRepairs`) held **167 option
  strings ending in a subject-specific essay clause** — "… The science
  explanation must account for the particles, forces, energy, cells, reactions,
  measurements and conditions; the option confuses a definition with its
  application." A student could discard those on sight, and 152 of them reached
  the rendered bank. All are stripped, and `grep 'must account for'` now returns
  nothing.

  **That filler was load-bearing, which is the part worth understanding.** It
  existed to stop the correct answer being the longest option, so removing it
  exposed **155 real CUEs** underneath, from 30 source questions. Those were
  fixed by authoring — mostly by shortening keys that had grown into
  mini-essays (one HSC key ran to 209 characters, a Media key to 339).

  **`law`, `rs`, `maths` and `hist` were then rewritten bank-wide (2026-08-28)**
  so the filler could come out of them too. The trap to avoid: fixing only the
  questions the audit currently flags chases the tail for ever, because these
  banks share strings across questions — shortening a key shortens a distractor
  somewhere else and promotes that question's key. Work instead from the
  invariant *"no key is longer than its own question's longest distractor,
  measured with the anti-cue loop stripped"* (`raw` from
  `dev/lib/source-bank.js`), fix every source question that violates it, and the
  count converges. It was 129 questions: 6 in law, 15 in hist, 36 in maths and
  72 in rs.

  Two shapes came up. A-Level keys had grown into mini-essays (one RS key ran to
  244 characters) — those were shortened. Maths keys were worked solutions
  against bare numeric distractors ("−2", "9/8"); there the answer belongs in
  the option and the working in the scaffold, which already had it, so the keys
  became the bare result. Where a key was a precise definition against one-word
  distractors (much of RS), the distractors were written out in parallel form
  instead.

  **`gcse-psych` and `gcse-hist` were not an authoring problem at all — the
  generator was (fixed 2026-08-28).** Their options have a median length of
  27-28 characters, so a key is "longest" by two or three characters and there
  is nothing to shorten; trying to close the gap string by string ends in
  mechanical padding, which is the bug this whole line of work exists to remove.

  The cause was `firstCheckpointPlans` / `secondGroupPlans` / the biology plans,
  which rebuild a Reforge twin whose option set merely permutes its parent's.
  Each walked a bank-wide pool of authored distractors and took the **first
  three usable entries**, so every question in the bank received the same three:
  `"The conclusion"` appeared in 25 of 25 GCSE-PSY-RESEARCH questions, and
  Social, Language, Brain and Problems each had their own trio.

  `pickFreshDistractors` replaces that. It picks the **least-used** candidates —
  the same fix the anti-cue loop already carries — and then applies two length
  rules that matter as much as the diversity:

  - among equally-used candidates, prefer the one **closest in length to the
    key**, so a terse answer ("Conformity", "Loss of pleasure") does not end up
    beside three long distractors and trip `SHORT CUE`;
  - if none of the three picked is at least as long as the key, swap the
    least-used candidate that is, so spreading the pool never creates a `CUE`.

  Getting either rule wrong is visible immediately: without the first, four
  psych twins became short cues; without the second, source cues rose by 10.

  Worst-case reuse across the whole bank fell 25 → 14 and strings used in more
  than 8 source questions 18 → 11 (the rest are numeric maths options and one
  media term). `gcse-psych` source cues 161 → 116 with no hand-authoring, and
  the total fell 1434 → 1410.

  Four subjects (`SOC-FAM`, `CRIM-COURT`, `POL-UKGOV`, `hsc`) build questions
  from a **shared pool of definitions, where each definition is the key in one
  question and a distractor in others**. In such a pool the single longest
  definition always cues its own question, so fixing one question just moves the
  cue to its neighbour — expect to chase it in circles. The stable fix is to
  make the pool's **two longest definitions exactly equal in length**: `CUE`
  fires only on a *uniquely* longest option, so a tie ends the oscillation for
  good. That is why some definitions in those banks are worded to an exact
  character count.

- **The "in this context" filler-padding bug is fixed — re-verify before
  trusting the paragraph below.** It used to describe 6,149 affected options
  across 30 subjects (`englit`, `engll`, `pe`, `span`, `mand`, `german`,
  `french`, `bus`, `gcse-psych`, and others). A live scan on 2026-08-10
  (`grep`/`vm`-load `data/forge-data.js`, search every option in every bank
  for `/in this context/i`) found **zero** occurrences anywhere in the file —
  `englit`, `engll`, `pe`, `span`, `mand`, `german`, `french`, `bus` and
  `gcse-psych` all came back clean, and a full-file sweep across every
  subject confirmed it. **The padding loops themselves were deleted on
  2026-08-28** — all seven of them
  (`while (options[distractor].length <= options[correct].length)
  options[distractor] += " in this context";`), so the mechanism that could
  reintroduce this is gone rather than dormant, and `grep 'in this context";'`
  returns nothing. `geoOptionRepairs` went with them; the other repair tables
  (`separateScienceOptionRepairs`, `geoAlevelDistractorRepairs`,
  `econAlevelDistractorRepairs`) remain and are still used. `dev/audit-banks.js` reports 0% cued stems and twins,
  consistent with this.

  Two gotchas if you ever need to extend a repair table like these: match on
  option **text, not letter** (`rebalanceMCQSubject()` permutes letters), and
  run the repair **last** — some reforge twins are rebuilt by later passes
  and will overwrite an earlier repair.
- `TAG_TAXONOMY_SUBJECTS` counts array-valued tags as a single composite key
  rather than incrementing each member, so a question tagged
  `["MC-A","MC-TECH-02"]` reads as used-once no matter how many questions
  share `MC-A`. 15 questions are affected across `geo`, `soc` and several
  others; it is why `geo`'s ratchet is 0.01 rather than 0.
- `englit` and `engll` reference the same two bank ids (`ENG-TERM-1`,
  `ENG-TECH-1`), so both subjects serve identical questions.
- Mandarin is represented by one subject key (`mand`) and one live bank.

Bank *structure* is otherwise healthy: `dev/audit-banks.js` reports 0 issues
and 0% cued stems and twins.

Question counts: the tools count different things, so quote the tool rather
than a single number, and re-run rather than trust this line — it drifts as
content lands. As of 2026-08-10: `scripts/checks/check-question-bank.js`
reports 7,626 questions (everything, including the short/extended-answer
shapes); `dev/audit-banks.js` reports on 7,531 gradeable MCQ stems;
`dev/test-forge.js` checks 7,731 MCQs including reforge twins. (Measured
2026-08-21.)
