# New GCSE subject teaser page — checklist

Use this to spin up a new pre-launch subject page (e.g. `gcse-{subject}.html`)
without re-deriving the pattern each time. Follow it in order.

## 0. Before you start

If you don't already know the exam board's spec structure cold, **ask the
user** rather than guessing:
- Exact board + spec code (don't assume — e.g. "OCR doesn't do GCSE
  Economics" turned out to be wrong; always check rather than assert).
- Which options/units the department actually teaches, for any subject where
  boards offer choices (History, English Lit, RS, etc.) — don't invent a
  plausible-sounding combination.
- If the qualification splits into separate examined disciplines under one
  award (Combined Science → Biology/Chemistry/Physics), ask whether that
  should be one page covering all of them or separate pages per discipline.

## 1. Copy the template

```bash
cp templates/gcse-subject-template.html gcse-{subject}.html
```

Use a short lowercase hyphenated slug matching the existing pages
(`gcse-psychology.html`, `gcse-economics.html`, `gcse-history.html`,
`gcse-science.html`).

## 2. Fill in the tokens

Search the new file for `{{` — every token is documented inline where it
appears (title/meta block, hero, spec section, sample questions, final CTA).
Key ones:

- `{{SUBJECT_TITLE}}` — e.g. "GCSE Psychology"
- `{{BOARD_NAME}}` / `{{SPEC_CODE}}` — e.g. "AQA" / "8182"
- `{{TOPIC_SUMMARY}}` — short comma list for meta descriptions
- `{{HOOK_SENTENCE}}` — name the *specific* skill or misconception pattern
  this subject's exam tests (not generic "trained, not memorised" filler —
  every existing page names something concrete: "contraction vs. shift",
  "explain, don't just describe", "source utility")

## 3. Spec-coverage section — one row per paper/discipline

Duplicate the `<!-- PAPER ROW -->` block once per paper the board actually
examines separately. Keep the badge grey/"In authoring" unless a real
question bank is genuinely live for that paper (see `gcse-geography.html`
for what a live badge looks like — `rgba(255,201,60,.15);color:var(--hot)`
background, badge text names the live bank).

## 4. Sample questions — one per `<!-- SAMPLE QUESTION -->` block

- Typical count is **2**; use **1 per discipline** for subjects that split
  (Combined Science → 3 questions, one Biology/Chemistry/Physics each).
- First question card needs `class="bq active"`; every other card is plain
  `class="bq"` — the carousel JS toggles `.active` and reads
  `#eco-bank .bq` generically, so no JS changes are ever needed regardless
  of question count.
- Write a genuine misconception a GCSE student would actually hold, phrased
  as something they'd confidently assert — then have the stem ask "why is
  this wrong?" Each wrong answer needs its own one-to-two-sentence scaffold
  in `data-s` that corrects that *specific* wrong belief, not a generic
  "that's incorrect."
- Update `<span class="bank-progress" id="ecoProgress">Question 1 of {{N}}</span>`
  to match the real count, and the section heading/lede N-word.
- Give `data-mc` tags a short subject-specific prefix
  (`MC-ELIZ-01a`, `MC-BIO-01a`) so they read like real misconception codes.

## 5. Final CTA + delete the template comment

Fill in `{{SUBJECT_TITLE}} is next in authoring.` and delete the big
`<!-- TEMPLATE ═══... -->` comment block at the top of the file before
publishing.

## 6. Link it from index.html

Every subject needs an "In development" card in the GCSE row of
`index.html`'s `#subjects` section (search for `class="subj soon"` to find
the existing ones — they're in a flat list, no per-level grouping needed).
If a plain unlinked "soon" card already exists for the subject (many
placeholders were added before their pages existed), replace it — don't
duplicate:

```html
<div class="subj soon">
  <div class="subj-top">
    <span class="pill">In development</span>
    <span class="mono boards">{{BOARD_NAME}} · {{SPEC_CODE}}</span>
  </div>
  <h3><a href="gcse-{{slug}}.html" style="color:inherit;text-decoration:none">{{Short subject name}}</a></h3>
  <p>{{One-line hook, different phrasing from the page's own hook sentence}}</p>
  <a class="subj-link" href="gcse-{{slug}}.html">Preview the subject page →</a>
</div>
```

## 7. Verify before committing

Start the local server (`preview_start` with the `forge-edu` launch config,
or `python3 -m http.server` from the repo root) and check, per question card:

- Click a wrong answer → it gets `.wrong`, the correct one gets `.correct`,
  the scaffold shows the right `data-mc` tag and text.
- `Next`/`Prev` carousel buttons move through every question and disable
  correctly at the first/last card.
- The spec-coverage rows and hero copy read correctly, no leftover
  `{{TOKEN}}` text anywhere (`grep -n "{{" gcse-{subject}.html` should
  return nothing once you're done, other than false positives inside actual
  question content if a stem legitimately contains double braces — unlikely).
- The `index.html` card links to the right page and renders inside the
  `#subjects` scroller.

## What this page is *not* for

This template is for **pre-launch teaser pages only** — no live question
bank behind them, honest "In development" framing, CTA to the waitlist
(`index.html#waitlist`), never a fake "X questions live" stat. If a real
bank gets built later for a subject that already has one of these pages
(the way `gcse-geography.html`'s Hazardous Earth bank went live after its
page was written), that page needs manual updating to the "live" pattern —
see `gcse-geography.html`'s hero/spec-section styling for what that looks
like. It won't happen automatically.
