---
target: Forge landing page in light and dark mode
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T19-03-54Z
slug: pages-marketing-index-html
---
# Forge Landing Page Critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Quiz and tab states are clear, but “Concept repaired” appears before the fresh proof question is passed. |
| 2 | Match System / Real World | 3 | Exam language is credible; Anvil, Crucible, re-forge, and misconception codes require explanation. |
| 3 | User Control and Freedom | 3 | Main interactions are reversible, but the collapsing navigation is not self-explanatory. |
| 4 | Consistency and Standards | 3 | Visual system is cohesive; Log in, Sign up, Join the list, early access, and Teacher dashboard imply overlapping account states. |
| 5 | Error Prevention | 3 | Email constraints and quiz choices are clear; conversion-state ambiguity remains. |
| 6 | Recognition Rather Than Recall | 3 | Product mechanics are demonstrated well; clipped mobile product navigation and specialist labels still require inference. |
| 7 | Flexibility and Efficiency | n/a | Persuade surface; power-user accelerators are not a meaningful criterion. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong hierarchy is weakened by navigation/footer density, miniature metadata, and detached disclosure notes. |
| 9 | Error Recognition and Recovery | 3 | Quiz recovery is excellent and the waitlist has fallback copy. |
| 10 | Help and Documentation | n/a | Persuade surface; contextual product documentation is not required here. |
| **Total** |  | **23/32** | **Good (72%), but not production-polished.** |

## Design Specificity Verdict

**LLM assessment:** Strongly authored for Forge, not category-interchangeable. The ember-and-paper material language, examiner-report grounding, shield mark, and wrong answer → misconception → scaffold → fresh proof story form a coherent product world. Specificity is strongest when the metaphor and mechanics coincide in the live demo and repair sequence. It weakens when generic SaaS patterns return: overloaded role navigation, repeated conversion labels, miniature dashboard chrome, and a long ungrouped footer.

**Deterministic scan:** The detector returned two source-level warnings in `pages/marketing/index.html`: `em-dash-overuse` and `aphoristic-cadence`. Both are false positives for the rendered redesign. The visible page has roughly 3,948 characters and four dash occurrences; the source still contains approximately 139,875 characters of hidden legacy content. The detector is correctly reacting to the retained source, but not to the visible new page.

**Visual overlays:** No reliable overlay is available. Mutable injection failed on the Browser's read-only evaluation surface, so no detector live server was started and no user-visible overlay is claimed. Per-viewport screenshots, DOM snapshots, and computed measurements were used instead.

## Overall Impression

The redesign has a real point of view and a persuasive product demonstration. Dark mode is the more emotionally distinctive expression; light mode is crisp and academically credible. The single biggest opportunity is simplification: make one conversion goal dominant, reduce navigation choices, and remove the remnants that make the page feel like a polished concept sitting on top of a legacy implementation.

## What’s Working

1. **The live misconception question is the page’s strongest asset.** It proves diagnosis, explanation, and follow-up testing without demanding an account or a long explainer.
2. **The visual world feels owned.** Warm paper, coal surfaces, ember accents, ruled details, and the repair metaphor reinforce the product thesis rather than merely decorating it.
3. **Trust is sequenced intelligently.** Specification mapping, examiner-report grounding, privacy, availability, and illustrative-data disclosure arrive before the final conversion request.

## Priority Issues

### [P1] “How it works” is functionally broken

**Why it matters:** The main explanatory navigation link changes the URL to `#how` but leaves the visitor at the hero. The visible repair section uses `id="redesign-how"`; `id="how"` belongs to a hidden legacy section. A high-intent visitor receives no visible response.

**Fix:** Point the navigation link to `#redesign-how`, or rename the visible section to `how` and rename/remove the hidden legacy ID. Verify anchor offsets under the sticky header.

**Suggested command:** `$impeccable harden`

### [P1] Navigation and conversion intent compete with the product story

**Why it matters:** The first viewport offers Try the quiz, Join early access, Join class, Log in, Sign up, a live answer choice, and theme switching. The labels also leave it unclear whether Forge is available now, in early access, or available only for certain subjects/schools.

**Fix:** Choose one primary conversion. Reduce desktop navigation to roughly four destinations plus sign-in and one CTA. Put Join class inside the student/sign-in path. Define early access precisely: new subjects, school pilots, or the whole product. Align Sign up, Join the list, and dashboard language to that model.

**Suggested command:** `$impeccable distill`

### [P2] Mobile navigation is dense, undersized, and too persistent

**Why it matters:** The mobile menu shows 11 simultaneous links in a translucent panel, duplicates Sign up, and leaves the hero competing underneath. At 360px, rows measure about 39.45px and the Menu button about 40px, below the 44px touch target. The full sticky pill also consumes roughly 64px through a very long page and can cover section context.

**Fix:** Use an opaque grouped menu, remove duplicate Sign up, raise every target to at least 44px, and collapse the scrolled state to mark + Menu or auto-hide on downward scroll. Add anchor scroll margins.

**Suggested command:** `$impeccable adapt`

### [P2] Consequential supporting text is too small or quiet, especially in dark mode

**Why it matters:** Proof descriptions, demo footnotes, product navigation, evidence metadata, disclosure labels, form notes, and footer links frequently sit at 10–12px. The information exists, but users can miss the evidence that makes the page credible. The waitlist placeholder also sits just below the desired 4.5:1 contrast target.

**Fix:** Raise meaningful supporting copy to 13–14px, strengthen dark-mode contrast, reserve 10px type for nonessential labels, and increase placeholder contrast. Reduce metadata rather than shrinking it.

**Suggested command:** `$impeccable typeset`

### [P2] Public narrative still exposes implementation and prototype residue

**Why it matters:** Two detached illustrative-data paragraphs appear between the subject directory and final CTA, while “Illustrative data” already exists inside the product window. The mobile product rail partially clips “Crucible,” the hidden legacy page remains in the DOM, and the subject directory leaves a large empty right column after it ends on desktop. These details lower perceived finish.

**Fix:** Keep one disclosure beside the data it qualifies, move subject availability language into the directory, remove hidden legacy sections and unused scripts, provide an explicit horizontal continuation cue or shorter product labels, and rebalance the evidence section after the directory ends.

**Suggested command:** `$impeccable polish`

## Cognitive Load

Moderate: three of eight checklist failures.

- **Single focus fails:** the opening offers multiple competing actions before the visitor has chosen a path.
- **Chunking fails:** the mobile menu has 11 undifferentiated links and the footer has nine ungrouped destinations.
- **Minimal choices fails:** desktop navigation, mobile navigation, the subject directory, and footer all exceed four simultaneous options.
- Grouping, hierarchy, one-thing-at-a-time storytelling, working-memory support, and progressive disclosure otherwise pass.

## Emotional Journey

- **Entry:** decisive and warm. The headline plus live question explains the product unusually quickly.
- **Peak:** the wrong-answer scaffold is the most persuasive moment on the page.
- **Reinforcement:** the three-stage repair sequence makes the core mechanism memorable.
- **Plateau:** the full product window becomes visually dense and miniature, particularly on mobile and in dark mode.
- **Reassurance:** specification, evidence, privacy, and subject coverage arrive at the right time.
- **Valley:** mobile navigation density, specialist terminology, and detached disclosure notes briefly make the page feel like an internal demo.
- **End:** the final CTA is visually strong, but “early access” creates uncertainty after the hero implies the quiz is already live and free.

## Section-by-Section Review

### Navigation

- The shield, wordmark, warm palette, and large rounded capsule feel distinctive.
- The theme toggle’s double ring competes with the primary Sign up button.
- Desktop collapse to a logo-only pill is elegant but unexplained.
- Mobile menu density and touch sizing need work; Sign up is duplicated.
- “Log in” and “Teacher dashboard” imply different authentication destinations without explanation.
- Focus-visible treatment and the skip link are thoughtfully implemented.

### Hero and live demo

- The headline is specific, memorable, and correctly dominates.
- Mobile’s shorter lede is stronger than the desktop paragraph.
- “Live practice” and “READY / LIVE BANK” repeat the same status.
- The secondary early-access link is visually weak but conceptually competes with the CTA.
- Wrong-answer feedback is excellent: choice state, named misconception, explanation, and re-forge action are clear.
- “Concept repaired” is premature until the fresh proof question is answered; use “Repair started” or delay the repaired state.
- The explanatory footnote is valuable but undersized.

### Proof rail

- The three claims are credible and well placed.
- Mobile stacking is clear but extends an already long page.
- Dark-mode descriptions need slightly more contrast and size.
- Retain at least one compact proof signal in the mobile first viewport.

### Repair sequence

- This is the clearest explanatory section and should remain central.
- `MC-INF-01` is visually elegant but not decoded for a first-time visitor.
- The right-aligned summary feels slightly detached from the three stages on desktop.
- Light mode gives the highlighted middle step especially strong clarity.

### Student/teacher product window

- Audience tabs are an effective way to avoid duplicated sections and work with keyboard navigation.
- The student 20% score needs “recent sample” context closer to the number so it feels diagnostic, not punitive.
- “Build corrective starter” is excellent teacher-facing value translation.
- On mobile, the internal Forge/Anvil/Crucible strip clips the last item; add a clear scroll cue or shorten labels.
- Dark-mode product chrome contains too much 10–12px metadata and adjacent near-black surfaces, flattening depth.

### Evidence and subject directory

- The headline is strong but overpowers the smaller evidence facts.
- Five identical “Explore” labels are repetitive; make row clickability obvious and reserve the verb for hover/focus.
- Standardise each subject row to level, board, qualification code, and availability status.
- The desktop right column ends earlier than the left, leaving a large empty compositional area.
- “See how questions are built” is a credible primary action.

### Final CTA, form, and footer

- The textured ending creates a satisfying return to the hero’s atmosphere.
- “See what a wrong answer can become” is an excellent closing line.
- `you@school.org.uk` implies an institutional email despite saying students are welcome; use a neutral example.
- Explain exactly what early access grants.
- Group the nine footer links under labels; the current row is hard to scan.
- Light-mode footer links are spatially loose; dark-mode links are too quiet.

## Theme Comparison

- **Dark mode:** stronger brand atmosphere and emotional fit. Improve contrast and depth among adjacent near-black surfaces, and enlarge consequential metadata.
- **Light mode:** crisp, academic, and credible. One assessment repeatedly saw paint/compositor corruption after theme switching and reload, while the independent per-viewport pass rendered correctly. Treat this as an automation/capture anomaly until reproduced in a normal physical browser; specifically stress-test the grain canvas, fixed blurred atmosphere, backdrop filters, and blend layers before release.
- **Both:** preserve the same hierarchy and ember accent; do not let dark mode carry more visual importance simply because muted supporting copy disappears.

## Persona Red Flags

### Jordan — confused first-timer

- Must interpret Anvil, Crucible, re-forge, `MC-INF-01`, spec points, live bank, and exam-board codes.
- Cannot confidently tell whether Forge is live, free, early access, or school-pilot only.
- Faces 11 mobile menu choices and several overlapping conversion labels.
- Is told “Concept repaired” before completing the proof step.

### Riley — deliberate stress tester

- Will notice the broken `#how` anchor immediately.
- Will question which figures, subject counts, and availability claims are live versus illustrative.
- Will test theme switching and reloads because one review exposed a possible compositor/capture failure.
- Will notice inconsistent subject metadata and the hidden legacy implementation beneath the redesign.

### Casey — distracted mobile user

- Loses vertical space to a persistent header across a roughly 6,891px page.
- Encounters dense sub-44px menu targets and duplicated Sign up.
- Must parse a miniature, horizontally clipped internal dashboard.
- Benefits from the full-width quiz CTA, four large answer choices, full-width re-forge button, and stacked email form.

## Minor Observations

- The mobile credibility proofline is hidden rather than compacted.
- Audience tabs are 42px high; several product actions are approximately 38px.
- Mobile subject-row hover rules still adjust padding as well as transform; avoid layout-affecting hover changes.
- The email placeholder contrast is approximately 4.33:1.
- Google Fonts remain externally hosted; self-host them if privacy, resilience, or performance matters.
- The source still carries roughly 255KB of hidden legacy markup and runtime work.
- A full-page automated screenshot duplicated sticky/animated layers and produced a blank half; per-viewport captures were reliable.

## Questions to Consider

- Is the primary conversion quiz start, account signup, or an early-access email?
- Should “Concept repaired” be earned only after the fresh scenario proves the fix?
- Would mobile explain the product better with three compact evidence panels instead of a miniature dashboard?
- How much Forge terminology can a new visitor learn before the metaphor becomes a comprehension cost?
- Should every subject row be required to make one precise, current availability promise?
