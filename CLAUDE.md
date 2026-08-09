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

Two other passes rewrite questions after the literals, worth knowing for the
same reason: `rebalanceMCQSubject()` swaps option *letters* (so always match a
key on answer text, never on letter), and `expandSubjectToMinimum()` clones
existing questions to pad a subject to 200, so an error in a source question
propagates into its `*-COV-*` copies and fixing the source fixes them all.

## Known outstanding issues

- Reforge option sets are currently distinct across every MCQ; keep
  `dev/test-forge.js` running as new content lands.
- GCSE History and GCSE Psychology still need ongoing scaffold-quality review;
  structural checks cannot judge whether an explanation genuinely teaches.
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
  `MC-SEP-*` set — see `docs/gcse-science-misconception-mapping.md`),
  `gcse-maths` (126 tags onto 90; all 90 labelled, 89 with a hand-written
  starter — its tags were already topical and merely split by a numeric
  suffix, so the work was merging variants, not designing a taxonomy),
  `hist` (37 shared `MC-HIST-*` tags, see
  `docs/history-misconception-mapping.md`), `soc` (185 questions onto 44
  categories) and `geo` (all 238 questions onto 52 categories, none carrying
  fewer than two, with 52 hand-written starters — see
  `docs/geo-misconception-mapping.md`). Substantially done: `psych` (0.18).
  `gcse-geo` (640 questions; 34/640 single-use = 0.053 and 0% mechanical
  tags after all 14 banks were hand-curated; see the bank mapping docs), and
  `econ` (515 questions onto 187 labelled taxonomy tags; 6/515 single-use =
  0.012 and 0 mechanical after stage 2; see
  `docs/econ-misconception-taxonomy-draft.md`). `gcse-geo` is now fully
  curated: its subject ratchets are 0.06 single-use and 0 mechanical, with
  labels and corrective starters for every shared taxonomy tag. `econ` is
  likewise complete apart from six genuine singleton concepts, each with an
  explicit starter.
  `gcse-psych` (202 questions onto 53 shared `MC-GPSY-*` categories, 0
  single-use and 0 mechanical; see
  `docs/gcse-psych-misconception-mapping.md`).
  `crim` (200 questions onto 30 shared `MC-GCRIM-*` categories, 0 single-use
  and 0 mechanical; see `docs/gcse-crim-misconception-mapping.md`).
  `law` (200 questions onto 22 shared `MC-GLAW-*` categories, 0 single-use
  and 0 mechanical; see `docs/law-misconception-mapping.md`).
  `pol` (200 questions onto 28 shared `MC-GPOL-*` categories, 0 single-use
  and 0 mechanical; see `docs/politics-misconception-mapping.md`).

  Next, roughly by value: the ~15 subjects still at 100% per-question tags.
  The audit fails
  if a subject listed in `TAG_TAXONOMY_SUBJECTS` regresses, if it exceeds its
  `TAG_TAXONOMY_MECHANICAL` share, or if an aggregatable tag has no starter;
  add a subject to both maps once it is retagged.

  Ranked by mechanical-tag share, the untouched backlog is: `chem` `bio` `phys`
  `rs` `hsc` `media` `french` `span` `pe` `englit`
  `engll` `mand` and `gcse-hist` all at 1.00,
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
- **The 0% cued figure is partly manufactured, and this is the big one.**
  About fifteen copy-pasted loops in `data/forge-data.js` do
  `while (options[distractor].length <= options[correct].length)
  options[distractor] += " in this context";`. That satisfies the
  answer-length rule by appending filler to a distractor, which is a *stronger*
  cue than the length it hides — a student eliminates the option trailing in
  repeated filler. **6,149 options across 30 subjects** are affected: `englit`
  and `engll` 492 each, `pe` 406, `span` 351, `mand` 288, `german` 278,
  `french` 269, `bus` 268, `gcse-psych` 262, and on down. None of them is ever
  a correct answer — the filler exists to make distractors out-length the key.

  A-Level `geo` is fixed (187 → 0) via `geoAlevelDistractorRepairs`, following
  the `geoOptionRepairs` / `separateScienceOptionRepairs` pattern that
  `gcse-geo` and the separate sciences already use: a curated table of genuine
  replacement text, so the padding loop has nothing to do. The rest is a
  content job — each replacement must be written, since the alternatives are
  padding or shortening correct answers, and the latter is what produced the
  override-table defects above. `dev/audit-banks.js` does not currently fail on
  filler; adding that check would stop it spreading.

  Two gotchas if you extend this: match on option **text, not letter**
  (`rebalanceMCQSubject()` permutes letters), and run the repair **last** —
  some reforge twins are rebuilt by later passes and will overwrite an earlier
  repair.
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
than a single number. `scripts/check-question-bank.js` reports 7,601 questions
(everything, including the short/extended-answer shapes); `dev/audit-banks.js`
reports on 7,506 gradeable MCQ stems; `dev/test-forge.js` checks 7,706 MCQs
including reforge twins.
