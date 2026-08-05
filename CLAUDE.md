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

- Reforge option sets are currently distinct across all 7,506 MCQs; keep
  `dev/test-forge.js` running as new content lands.
- GCSE History and GCSE Psychology still need ongoing scaffold-quality review;
  structural checks cannot judge whether an explanation genuinely teaches.
- Misconception labels and starter activities remain a product-quality backlog:
  the teacher heatmap should show human-readable labels and useful intervention
  suggestions for every active tag. The blocker is *tagging*, not starters —
  most subjects give each question a tag unique to itself (`tag === "MC-" + id`),
  so nothing aggregates and every starter falls back to a generic drill. Done so
  far: `psych`, `gcse-geo`, `soc`, `econ`, `gcse-econ` (420 questions regrouped
  onto 76 shared `MC-GE-*` tags) and the three `gcse-sep-*` sciences (600
  questions on 96 shared topic tags, one per bio/chem/physics topic). Next,
  roughly by value: `gcse-science` — its 212 questions still sit on 156 tags,
  and most should be remapped onto the existing `MC-SEP-*` science tags rather
  than given a set of their own, since combined science is a subset of the
  separate content — then `gcse-maths`, then the ~15 subjects still at 100%
  per-question tags. `dev/audit-banks.js` fails if a subject listed in its
  `TAG_TAXONOMY_SUBJECTS` regresses, or if an aggregatable tag has no starter;
  add a subject there once it is retagged.
- Not every subject needs a fresh taxonomy first: `gcse-sep-*` already carried
  good topic tags, so the work there was purely labels and starters. Check what
  a subject's tags actually look like before assuming a retag is needed.
- A-Level Geography is intentionally marked Developing until every active route
  point is mapped.
- `englit` and `engll` reference the same two bank ids (`ENG-TERM-1`,
  `ENG-TECH-1`), so both subjects serve identical questions.
- Mandarin is represented by one subject key (`mand`) and one live bank.

Bank *structure* is otherwise healthy: `dev/audit-banks.js` reports 0 issues
and 0% cued stems and twins across all 7,506 questions.
