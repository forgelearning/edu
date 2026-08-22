# Forge audit — remaining work (handoff)

Paste this whole file as the first message of a new chat.

---

## Context

You are picking up a Forge audit. A previous session walked the whole product as
student, teacher and SLT, produced a findings list, and fixed most of it. That
work is **merged to `main`** (PRs #186 and #187). `npm run check` is a 26-step
gate and passes on `main` as of 2026-08-22.

Findings were labelled S (security), F (functional), C (content), U (interface)
and P (product). Everything below is what is left.

**Read `CLAUDE.md` first.** It carries the repo's working rules, and two
invariants added during this work that are easy to undo by accident:

- A class's school is server-derived from the teacher's invite, not typed.
- `ECON100_SCAFFOLDS` must stay complete.

---

## Ground rules learned the hard way

- **Other sessions work in this repo at the same time.** `main` moved twice
  mid-flight and produced eight merge conflicts, including two sessions fixing
  the same findings differently. Fetch and check before starting. Never
  `git add -A`; stage the specific files you changed.
- **`innerText` lies on some of these pages.** It returned `''` for a container
  that was rendering correctly at 230px tall. One audit finding (P5) was wrong
  because of it. Confirm UI claims with a screenshot, not a text dump.
- **The database is production and shared.** It holds one real school:
  27 classes, 94 pupils, 1,230 responses. Seed disposable data under a `ZZ-`
  prefix and delete it afterwards; verify the real counts are unchanged.
- **Tests here are often text greps.** Two of them failed on code comments that
  merely contained the words `window.confirm` / `window.prompt`. If a grep test
  fails, check whether it is matching prose before changing behaviour.
- Migrations are applied to the live project via the Supabase MCP tool, and the
  matching `.sql` file goes in `supabase/migrations/`. The front end and the
  database can drift out of sync between commit and merge — say so if they do.

---

## Remaining items

### C1 — the inverse length cue (largest, unlocks C2's remainder)

`node dev/audit-source-cues.js` reports **2,411 of 15,063 items (16.0%)** have
the correct answer as the single longest option *in source*. A runtime anti-cue
loop masks all of them, so students see 0 cued questions — but the loop works by
swapping in an already-authored distractor that is longer than the key, which is
what causes the recycling in C2 and drags topically wrong options into
questions.

Worst subjects: `gcse-econ` 61.2% (514/840), `econ` 50.9% (529/1039),
`gcse-psych` 39.9% (161/404). Measured 2026-08-22, after the C2 pass.

The fix is authoring: shorten keys and write distractors of comparable length in
the source, subject by subject, so the loop can eventually be deleted. Re-measure
with `dev/audit-source-cues.js` (report-only, never fails a build).

Note the side effect: a student can currently score above chance by *avoiding*
the longest option, because the loop guarantees the longest option is wrong.

### C2 remainder — one entry, gated on C1

`RECYCLED DISTRACTOR` is at **1** (baseline 1, down from 42). Authored recycling
is 0. The survivor is `2.5.2/BNK-08`, whose 182-character distractor exists to
out-length a 139-character key. Swapping it makes the key the longest option, so
the redistribution pass correctly refuses. It falls when that key is rewritten —
C1 work.

### S1 — legacy name-only class joins (do before the pilot widens)

**26 of 27 classes** have no access codes at all, and **67 of the 69 pupils who
are in a class** have no private code. (The other 25 pupil rows are free-tier
users with no class, which is normal and not part of this.)

The migration path exists and is now dialog-free
("Migrate existing students" on the teacher dashboard, which shows the codes on
screen as well as downloading them). Every class added meanwhile is another to
migrate. Deferred deliberately during the pilot — confirm with the user before
starting.

### S5 — leaked-password protection (user action, not code)

Supabase's HaveIBeenPwned check is **Pro-plan only** and the org is on Free
(confirmed in the docs and via `get_organization`). It is also a dashboard
toggle with no MCP tool. Nothing to implement; the user must upgrade and enable
it. Minimum password length and required character classes are *not* Pro-gated
and could be raised in the dashboard now.

### P2 — held, and its text was never captured

The user said "hold off" on P2 and the finding text is not recorded anywhere.
**Ask them for it before doing anything.** Do not guess.

### P5 remnant — no per-question review of a completed assignment

The original P5 ("a completed assignment disappears without a trace") **was
wrong** — verified by screenshot: the card persists with a COMPLETED badge, due
date, "8 of 8 questions answered" and a score. What is genuinely missing is
narrower: a pupil can see they scored 75% but cannot review *which* questions
they got wrong. Small feature, `pages/app/assignments.html`.

### Landing page accessibility (from `.impeccable`, re-measured 2026-08-22)

`pages/marketing/index.html` embeds two illustrative dashboard mocks containing
**13 `href="#"` placeholders**, and the mocks are not marked `inert` or
`aria-hidden="true"`. Keyboard and screen-reader users tab into thirteen links
that go nowhere. One-attribute fix, ~15 minutes. The related "multiple `<h1>`"
complaint in those critiques is already fixed (there is exactly 1).

Also in `.impeccable/critique/`, and **not** defects — design decisions for the
user, not for an agent to action unasked:

- One homepage serving students, teachers and schools at once.
- Mobile hero reaching the question proof too far down.
- 168 em-dashes flagged as "mechanical cadence". This is the house voice; a
  mechanical sweep would make the copy worse. Recommend leaving it.

---

## Housekeeping the user still needs to do

- `mikezanier@gmail.com` and `forge.educator@gmail.com` have no
  `teacher_profiles` row, because they own no classes and the backfill could not
  infer a school. **They cannot create classes until they enter the invite code
  `MAYFIELD-STAFF` once.** The main teaching account is provisioned and fine.
- CI (`.github/workflows/pages.yml`) only runs on pushes to `main`, so feature
  branches get no CI. Run `npm run check` locally before opening a PR.

---

## Suggested order

1. Landing-page `inert` fix (15 min, real accessibility defect).
2. P5 remnant (small, self-contained) — after asking whether it is wanted.
3. S1 — time-sensitive, gets worse as the pilot grows.
4. C1 — the big one; C2's last entry falls out of it.
5. P2 — only after the user supplies the text.

Ask before starting anything the user has previously deferred (S1, C1, P2).
