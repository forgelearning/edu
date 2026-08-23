---
target: teacher class page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T08-55-29Z
slug: pages-app-teacher-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Metrics, active view, and class context are visible, but the page is long and the main work area quickly moves below the fold. |
| 2 | Match System / Real World | 3 | The “next best action” framing fits teacher intervention work; some internal terms remain technical. |
| 3 | User Control and Freedom | 3 | Class switcher, back action, tabs, and collapsed tools are available and understandable. |
| 4 | Consistency and Standards | 3 | Controls and emphasis use the established Forge system consistently. |
| 5 | Error Prevention | 3 | Destructive/class-management actions are tucked into Class tools; more confirmation context would help. |
| 6 | Recognition Rather Than Recall | 3 | Metrics and student action are recognizable, but misconception tags require decoding. |
| 7 | Flexibility and Efficiency | 3 | Tabs and direct student actions support frequent users, though the left rail is icon-only. |
| 8 | Aesthetic and Minimalist Design | 2 | The bold treatment now creates a strong focal point, but the top action panel is oversized relative to the data beneath it. |
| 9 | Error Recovery | 2 | The class view does not visibly surface retry or recovery guidance when data loading fails. |
| 10 | Help and Documentation | 2 | The calculation disclosure helps, but class-management and misconception terminology are not explained in place. |
| **Total** |  | **27/40** | Solid operating foundation; hierarchy and density still need one more refinement pass. |

## Design Specificity Verdict

The page feels authored for Forge rather than category-interchangeable: the amber/orange intervention language, misconception queue, Re-forge metric, and student-first next action give it a distinct teaching workflow. The strongest design move is the single intervention recommendation. The risk is that the page’s expressive treatment now outpaces its information structure: a very large action panel dominates while the ranked misconception evidence is pushed down.

The deterministic detector returned no findings for `pages/app/teacher.html`. That is a clean mechanical result, not proof that the hierarchy is finished.

## Overall Impression

The class page has a clear point of view: help a teacher decide who or what to address next. The visual system is confident and cohesive. The biggest opportunity is to make the evidence arrive faster and reduce the number of simultaneous “next” cues.

## What’s Working

- The class header establishes context quickly with class name, code, student count, and scored-answer count.
- The two metric cards are highly scannable and use color meaningfully: green for accuracy and amber for open signals.
- Class tools are appropriately secondary and the rename control is no longer competing with the teaching workflow.

## Priority Issues

### [P1] The next-action panel is too dominant

Why it matters: The oversized “Address the strongest misconception signal” block consumes most of the first viewport and delays the actual ranked signals that justify the recommendation.

Fix: Reduce the panel’s vertical footprint by about 25–30%. Keep the title and primary CTA large, but move the explanatory copy and student shortcut into a tighter secondary row.

Suggested command: `$impeccable layout`

### [P1] Two primary actions compete inside one recommendation

Why it matters: “Open priority signals” and “Start with Alfred W” are both orange, high-emphasis actions. A teacher can understand the intent but not the preferred sequence at a glance.

Fix: Make “Open priority signals” the sole primary action. Style the student shortcut as a quieter inline recommendation or a secondary button.

Suggested command: `$impeccable clarify`

### [P2] Misconception rows are dense and code-forward

Why it matters: Long codes such as `MC-DEV-MEASURING-DEVELOPMENT` and `GCSE-GEO-DEV` compete with the plain-language explanation. Teachers need the teaching idea first, not the identifier.

Fix: Lead each row with the human-readable misconception label, move the code into muted metadata, and keep the error count as the strongest trailing datum.

Suggested command: `$impeccable distill`

### [P2] Icon-only left navigation raises recognition cost

Why it matters: A first-time teacher must infer several rail icons before reaching Class, Assignments, or Spec Points.

Fix: Add visible labels when the rail is expanded and provide reliable tooltips for the collapsed state.

Suggested command: `$impeccable clarify`

## Persona Red Flags

**Jordan (First-Timer):** The collapsed left rail is icon-only, and terms like “Spec Points,” “Re-forge,” and “Open misconception signals” need prior product knowledge. The page gives Jordan a strong action but not enough explanation of what will happen next.

**Alex (Power User):** The page provides direct tabs and a student shortcut, but the large recommendation block adds vertical distance before the ranked data. Alex may feel slowed down when scanning several classes in sequence.

**Casey (Data-Heavy Teacher):** The metrics are clear, but the long misconception identifiers and repeated “1 error · 1 student” rows create visual noise. Casey needs the human-readable signal and count to dominate.

## Minor Observations

- “Teacher Dashboard” and “COMMAND CENTRE / INTERVENTION QUEUE” both label the same header; one can be quieter.
- The “How these numbers are calculated” disclosure is useful but visually easy to miss.
- The sticky tab bar is helpful during scrolling, though its shadow and active treatment add another high-contrast band.
- The page needs a tested empty state where there are no open signals; the current action hierarchy should remain coherent there.

## Questions to Consider

- Should the teacher’s first viewport show the ranked misconception evidence immediately, with the recommendation as a compact lead-in?
- Is “Start with Alfred W” a shortcut to the same destination as “Open priority signals,” or does it represent a different decision? If it is the same decision, why are both primary?
- Would a teacher understand “Re-forge” without seeing the student workflow, or should the first use include a short explanation?
