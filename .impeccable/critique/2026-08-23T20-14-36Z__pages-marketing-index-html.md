---
target: everything else on the Forge landing page
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T20-14-36Z
slug: pages-marketing-index-html
---
# Forge landing page critique

## Assessment provenance

Dual-agent assessment. Assessment A reviewed design quality, usability, cognitive load, emotional journey, and persona impact. Assessment B independently verified the live page in desktop and phone viewports, light and dark themes, keyboard and interactive states, accessibility geometry, and automated anti-pattern detection.

## Design specificity

The page feels strongly authored for Forge rather than assembled from a generic landing-page kit. Its warm paper, coal, and ember palette; live economics question; repair loop; examiner language; and paired student/teacher views form a coherent learning product story. The least distinctive elements are the floating pill navigation, the repeated large editorial section rhythm, and the generic email-form close.

## Heuristic evaluation

| Heuristic | Score | Notes |
|---|---:|---|
| Visibility of system status | 3/4 | Demo feedback and form status are clear, but focus is lost after some answer-state transitions. |
| Match with the real world | 3/4 | The learning workflow and examiner language are concrete; Anvil and Crucible need lightweight explanation for first-time visitors. |
| User control and freedom | 2/4 | A wrong demo answer temporarily locks choices without an immediately visible reset, and the collapsed desktop navigation creates a focus trap-like experience. |
| Consistency and standards | 3/4 | Visual and interaction patterns are consistent overall; some text links and subject rows do not look as actionable as they are. |
| Error prevention | 3/4 | Form validation and answer-state guardrails are sound. |
| Recognition rather than recall | 3/4 | Most content is self-explanatory; the product taxonomy and static-looking faux navigation increase interpretation cost. |
| Flexibility and efficiency | N/A | Not central to a persuasion landing page. |
| Aesthetic and minimalist design | 3/4 | Strong editorial restraint, with a denser-than-needed mobile product instrument and some repeated trust content. |
| Help users recover from errors | 3/4 | Error copy is good, but demo reset and keyboard focus recovery should be more immediate. |
| Help and documentation | N/A | Not central to this page. |

**Score: 23/32 — Good.** The page is persuasive and distinctive, but not yet excellent because a few interaction and hierarchy defects affect core paths.

## Cognitive load

Moderate overall. Five of eight checks pass. The main failures are:

- The close presents two competing actions and visually promotes the school-pilot path over the primary quiz path.
- The mobile product view exposes too much interface anatomy at once: faux navigation, focus card, score, routes, and tables.
- The middle of the dark-mode page has too many similarly weighted dark nested surfaces, reducing grouping clarity.

## Emotional journey

The opening creates a strong, confident peak. Trust rises through the live demo and concrete product evidence. The main attention valley is the long mobile product instrument, especially in dark mode, where nested surfaces become visually muddy. The final section weakens the peak-end effect because the school-pilot button appears more important than trying the quiz.

## What is working

1. The live question is the page's strongest product proof: visitors experience the learning loop instead of merely reading claims.
2. Trust is unusually concrete for an education landing page: illustrative-data caveats, exam boards, codes, privacy language, and subject routes make the proposition credible.
3. Responsive fundamentals are sound: no horizontal overflow was found at 390px, the mobile menu is grouped clearly, Escape restores focus, primary controls meet comfortable touch sizing, and both themes remain coherent.
4. Semantic fundamentals are good: one H1, logical heading order, unique IDs, labelled controls, live status regions, and properly implemented tabs with arrow-key navigation.

## Priority issues

### P1 — Navigation and focus safety

After roughly 60px of downward desktop scrolling, the full navigation collapses visually but its off-screen links remain keyboard-focusable. The skip link also changes the URL fragment without reliably moving focus into `main`, and the sticky navigation partly obscures the destination on phone.

Recommended direction: retain a compact persistent bar with the mark, primary quiz action, and menu; either expand it on `focusin` or remove truly hidden controls from the tab order. Make `main` programmatically focusable, move focus there from the skip link, and give it an appropriate scroll offset.

### P1 — Final conversion hierarchy is reversed

The intended primary action, trying the quiz, is an understated underlined link while the school-pilot action is a bright ember button. This makes the lower-frequency, higher-commitment action dominate the close.

Recommended direction: make “Try a question” the full primary button and present the school pilot as the secondary action or a quieter disclosure/form path.

### P2 — Mobile product proof is over-detailed

The two-view product instrument becomes a long stack of faux sidebars, scores, routes, and tables. On dark mode its nested coal surfaces have insufficient tonal separation, producing the page's weakest visual stretch.

Recommended direction: create an editorial mobile crop rather than shrinking the desktop instrument. Remove faux navigation on small screens, show one student outcome and one teacher signal, defer supporting tables, and establish one clearly raised layer with stronger rules in dark mode.

### P2 — Demo recovery and focus management

A wrong selection disables the answer controls and removes keyboard focus; the reforge transition also returns focus to the document body. Reset exists later in the flow, but not immediately after the first answer.

Recommended direction: expose Reset after every selection, keep Reforge as the primary next step, and explicitly move focus to the revealed feedback or next-action heading/status after each transition. Preserve the existing live-region announcements.

### P2 — Action affordance and touch polish

Subject rows read as static content after their arrows were removed. Several secondary text links are only about 17–21px tall, including student-view, guide, coverage, FAQ, final quiz, and footer links. Spacing prevents a severe collision risk, but the affordance is weaker than the rest of the interface.

Recommended direction: add a restrained authored chevron or “View subject” cue to subject rows, strengthen visible focus states, and enlarge the interactive area of secondary links to a comfortable minimum without making their typography visually louder.

## Persona impact

- **Jordan, first-time learner:** may not understand Anvil/Crucible language and can mistake faux product navigation or subject rows for static decoration.
- **Riley, keyboard or imprecise-input user:** can lose their place after a demo answer and cannot immediately reset a mis-click.
- **Casey, mobile visitor:** faces an approximately 7,300px page whose densest product section arrives mid-journey, creating a noticeable attention valley.
- **Priya, prospective student:** reaches a close that visually prioritizes a teacher/school email action over the quiz she came to try.
- **Ms Khan, teacher:** receives credible evidence, but deeper subject pathways do not clearly advertise themselves as interactive.

## Minor polish opportunities

- The desktop navigation carries six labels plus theme control; the grouped mobile menu is cognitively cleaner and could inspire the compact desktop state.
- The credibility rail and later evidence facts repeat on phone; one concise trust summary can replace duplicated reassurance.
- Dark mode remains emotionally uniform through the middle; a slightly lighter product-proof surface would improve pacing without adding color noise.
- Faux sidebars are labelled as navigation even though they are static representations; simplifying or relabelling them would reduce false affordance.
- A benign `AbortError: Transition was skipped` appeared during rapid automated interaction, likely from a cancelled view transition. It should be caught or avoided under rapid/reduced-motion state changes so the console remains clean.
