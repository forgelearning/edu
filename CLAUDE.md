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

## Known outstanding issues

- **Permuted Reforge twins — the big one.** 1,102 of 7,506 questions (14.7%,
  across 59 banks) have a `reforge` whose option set is identical to the
  parent question's, just reordered. The student sees the answer highlighted
  and then the same four options again, so the twin gives it away. This is
  the failure mode authoring rule 4 warns about, and `dev/audit-banks.js`
  does **not** detect it — it only checks structure and cueing. Worst banks:
  `RS-1` 51/116, `ECON-1.1` 49/99, `4.1.1` 48/100, `PHYS-3` 46/84,
  `HSC-2` 45/112. `GCSE-PSY-MEMORY`, `-PERCEPTION` and `-DEVELOPMENT` are
  100% affected. Rewrite by hand; do not permute with a script.
- **Boilerplate scaffolds.** 232 questions across 12 banks (all GCSE History
  and GCSE Psychology) have a scaffold matching
  `This tests the <spec> knowledge point: <answer>`, which restates the answer
  instead of teaching. Combined with the point above, GCSE Psychology is the
  weakest subject currently live.
- **Misconception labels are half missing.** 711 of 1,300 tags used in the
  bank have no entry in `MC_LABELS` (defined in `teacher.html`, mirrored in
  `school-overview.html` and `anvil.html`), so the teacher heatmap and School
  Overview show a raw code instead of a description. Worst prefixes:
  `GCSE-P2` (112), `GCSE-DEF` (84), `GEO-SKILL` (20).
- **Starter activities cover 54 of 1,300 tags.** Everything else falls back to
  `getDefaultStarter()`, a generic stub. The teacher sign-in page promises
  "which starter activity will help you address them", so this gap is
  user-visible.
- `englit` and `engll` reference the same two bank ids (`ENG-TERM-1`,
  `ENG-TECH-1`), so both subjects serve identical questions.
- `SUBJECTS.mandarin` is a `readerMode` subject with `banks: []`, separate
  from the populated `mand` ("IB Mandarin"). Two Mandarin cards both showing
  IB Language B SL is confusing — merge or rename.

Bank *structure* is otherwise healthy: `dev/audit-banks.js` reports 0 issues
and 0% cued stems and twins across all 7,506 questions.
