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

Two efforts have overlapped here. The split:

| Area | Status |
|---|---|
| Theme 2 — Themes 2.1 and 2.2 | Done, 20 questions per bank |
| Theme 2 — 2.3, 2.4, 2.5, `ECON-1.1` | Outstanding, still 5-8 questions each |
| Theme 1 | Not started |
| Themes 3 and 4 (`3.1.1`, `3.2.1`, `4.1.1`) | Started separately, 6 questions each |

The Theme 3 and 4 banks were built before the authoring standard above and
currently show cued Reforge twins (`3.1.1` is 83%). Worth a pass with
`dev/audit-banks.js` before they are extended further.

## Known outstanding issues

- `SUBJECTS.mandarin` lists no banks, so its subject card is dead. Either
  populate it or remove the entry. (`mand` is a separate, populated subject.)
- `englit` and `engll` reference the same two bank ids (`ENG-TERM-1`,
  `ENG-TECH-1`), so both subjects serve identical questions.
- The older, small A-Level banks (`bio`, `chem`, `phys`, `maths`, `bus`,
  `soc`, `law`, `pol`, `media`, `pe`, `span`, `crim`, `cs`, `rs`, `hsc`,
  `french`, `german`, `hist`, `mand`, `geo`) have Reforge twins that are
  75-100% cued and heavily "B"-skewed. Roughly 340 questions. The GCSE banks
  and `psych` are already clean.
