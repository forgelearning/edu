# Forge student-first pilot plan

**Decision:** 3 October 2026<br>
**Applies to:** the current Geography and Economics classes and students trying individual subjects.<br>
**Evidence base:** [Forge review, 3 October 2026](forge-review-2026-10-03.md). This is a delivery plan for the current working tree, not a claim that local changes are deployed.

## Product focus

Make Forge the place a student can open for a short, relevant session, understand a mistake, and know what to revisit next. The next release should improve the sequence:

**Open Forge → see the right work → answer → understand and retry → save progress → return for a useful review.**

For class students, “right work” usually means their teacher's subject and an active assignment. For an individual tester, it means the subject they chose last time. Both should be able to explore other subjects without starting from the full catalogue every visit.

## Teacher boundary during this plan

Maintain the functions required to run the existing classes: teacher sign-in, class and pupil access, setting and viewing assignments, a basic completion/misconception view, and data access/deletion controls. Fix a defect in these paths if it blocks a student or undermines trust. **Do not schedule new teacher dashboard features, school-wide reporting, or broader administration workflows** during these three releases. Teacher requests from the live classes go into a separate evidence list for later prioritisation.

## Release sequence

### Release 0 — establish a trustworthy baseline (first week)

| Work | Concrete output | Acceptance |
|---|---|---|
| Verify live pupil journeys | Run the protected coded-student end-to-end test against the intended deployment or staging with disposable records. Check join, answer save, assignment attribution, returning history, revision sync, and isolation from another pupil/class. | The test **runs rather than skips**, cleans up its records, and the pupil and teacher views agree on the saved work. |
| Observe current students | Watch 6–10 pupils across the live classes and individual testers complete: enter their subject, find work, answer, use a similar question, return to an error, find Revision, and locate saved progress. | Record task completion, help needed, time to the first relevant question, and the top three points of confusion. No broad claim about all students from this small sample. |
| Establish pilot boundaries | Record the actual class subjects, exam routes, devices, access type, and which individual-subject testers use free/class/Pro accounts. Confirm the school's existing data-use and retention arrangements before collecting extra pilot measures. | The team can identify who is in each route and which data is available for evaluation. |

**Release decision:** If answers or identities do not persist correctly under live policies, fix that before changing student navigation or adding content.

### Release 1 — reach the right work quickly (weeks 2–3)

1. **Remember the student's context.** A class pupil lands in their class subject. An individual tester's chosen subject persists across visits and appears first. A clear Browse all subjects action still exposes the catalogue.
2. **Make Home a single next-step decision.** Use this order: urgent teacher assignment; one active idea to repair; due revision; recent or chosen topic. Show why the step is suggested and keep other destinations visible but secondary. Do not mix “new” cards into a “due” count.
3. **Simplify the practice picker.** Lead with topic names and the short-session action. Remove bank IDs and abbreviations from student-facing cards. Keep exam-board and coverage details available under a disclosure for pupils who need them.
4. **Make progress trustworthy.** Show when an answer is saved, queued to retry, or unsaved. After interruption, return to the correct unfinished session. Check free quota behaviour with individual testers before changing the allowance; an assigned or promised pilot activity must not stop unexpectedly.

**Acceptance:** a returning pupil reaches a relevant question within two choices; observed pupils can explain what the main Home action will do; an interrupted session resumes without an extra or lost response; failed saves never present as completed work. Test desktop and phone widths, class-code and solo routes, and both fresh and returning students.

### Release 2 — make repair and return useful (weeks 4–5)

1. **Review the explanation loop in the taught Geography and Economics units.** Start with the units the current classes are using and the questions that generate repeated errors. Have a teacher inspect the wrong-answer explanation and similar question, as well as ambiguity and answer-length cues. Resolve the duplicate option and any high-impact warnings in those units.
2. **Clarify the Revision queue.** Label due, new, and personal cards distinctly. Keep the eight-card session manageable after an absence. Make it obvious how self-rating affects the next return and whether cards follow a student across devices for their access type.
3. **Check repair after a delay.** Offer a fresh question on the same misconception about a week after an immediate repair. Display that delayed result separately from first attempts and the immediate similar-question score in the student's progress view. Use small-sample counts rather than a misleading mastery percentage.
4. **Add one exam-transfer task per taught route, only after item review.** Geography: data/fieldwork or a decision task. Economics: a diagram, calculation, or brief chain of reasoning. Supply a teacher-reviewed answer or mark points; keep marking simple and transparent.

**Acceptance:** the current classes can complete a short end-to-end cycle from wrong answer to later check; a pupil can say why a card is due; the reviewed taught units have a dated issue list and fixes; the exam task is usable without a new AI marking workflow.

### Release 3 — tune from use, then choose the next investment (week 6)

- Repeat the same student tasks with a comparable group. Compare completion, help requests and time to relevant work with the baseline.
- Inspect saved response counts, session completion, similar-question attempts, delayed checks and voluntary returns separately for class and individual testers. Use authorised learning records and direct observation while app event ingestion remains paused.
- Ask students which step helped them understand a mistake, which felt repetitive, and what they expected to find on Home. Ask the teachers only whether the minimum class functions worked and what student difficulty they saw.
- Decide one of three next moves from the evidence: improve onboarding/navigation, deepen the repair content in current routes, or extend delayed revision. Do not infer improved grades from this short pilot.

## Work list in implementation order

| ID | Priority | Student outcome | Likely touchpoints | Depends on |
|---|---|---|---|---|
| S0 | Gate | Class and solo work saves to the right student and reappears | `dev/test-coded-student-e2e.js`, response writer, class access and history | Protected staging/deployment test access |
| S1 | High | Student returns to their own subject or class work | student dashboard, quiz subject picker, class context | S0 |
| S2 | High | Home offers one relevant next step with a clear reason | dashboard recommendation, assignment/Anvil/Revision state | S1 |
| S3 | High | Student can start a topic without decoding bank IDs | quiz topic picker and navigation copy | S1 |
| S4 | High | Student trusts save, retry, quota and resume states | quiz and Revision session states | S0 |
| S5 | High | Mistake leads to a correct, clear explanation and fresh check | taught-unit question banks and scaffolds | student observations |
| S6 | Medium | Due revision is understandable and easy to finish | Revision queue, Home entry point, progress | S2 |
| S7 | Medium | Student sees whether a repaired idea holds later | Revision selection and progress | S5–S6 |
| S8 | Medium | Student practises one authentic non-MCQ task in a taught unit | pilot bank and simple answer review | S5 |

The file names indicate likely areas, not a requirement to alter all of them. Keep the existing broad catalogue and teacher tools working while making the pilot path shorter.

## Measures and release rules

| Measure | Why it matters | How to read it |
|---|---|---|
| Time/choices to first relevant question | Tests whether Forge removes the “where do I start?” problem | Compare the same task before and after Release 1, including students who need help. |
| Saved set completion | Exposes access, quota, interruption and persistence failures | Count invited pupils and completed saved sets separately by class and solo route. |
| Immediate repair and delayed check | Tests whether the distinctive loop does more than reward a second guess | Report wrong answers, similar-question attempts, immediate passes, and later fresh checks with pupil/item counts. |
| Voluntary return | Tests whether students find value without a new assignment | Separate self-directed sessions from teacher-set sessions; do not equate a streak with learning. |
| Student clarity | Reveals hidden navigation or misleading labels | Record unassisted task success and short student explanations, not only clicks. |

Release 1 requires a passing live save/access check and no known route that silently loses a response. Release 2 requires a teacher-reviewed sample of the taught units and a clear explanation of due versus new revision. Release 3 is a decision point, not an automatic feature launch.

## Explicitly deferred

New teacher analytics, school overview expansion, parent features, new subject rollouts, more league/friends mechanics, a video course, AI tutor, and automated essay marking. Maintain existing teacher access and safety controls; schedule expansion only when current student use shows a clear need.
