# Forge product review and next release plan

**Date:** 3 October 2026<br>
**Context:** A small live pilot in Geography and Economics classes, with some students trying individual subjects. This reviews the current working tree; many existing files have uncommitted changes. It is a product and local implementation review, not a claim that every change is deployed.

**Planning update:** The [student-first pilot plan](student-first-pilot-plan.md) is the current release sequence. The broader priorities below remain the review's findings.

## Executive view

Forge has a credible, distinctive learning loop: identify the mistaken idea behind an answer, explain it, and test the repair with a fresh question. The teacher view can turn the same misconception data into a starter activity. That is the product to strengthen. Forge should aim to become the fastest dependable route from **a specific wrong idea to a corrected answer and a useful next lesson**.

The next release should focus on the students and classes already using it. It should make the right subject and assignment obvious, prove that answers and progress save under real class access rules, improve the quality of the pilot banks, and show whether an idea stays repaired after a delay. The current breadth of subjects is an asset for discovery but creates choice overload and a quality burden. Do not use bank size or nominal specification coverage as a proxy for exam readiness.

## Evidence and limits

- The local build reports **7,758 questions in 168 banks**. Of these, 7,663 are multiple choice, 72 fill blank, 17 short answer, and 6 extended answer. The checked subject pages report GCSE Geography **772**, GCSE Economics **420**, A Level Economics **536**, and A Level Geography **238** questions. `data/content-status.json` marks A Level Geography as developing at **91%** selected route coverage; the other three are marked full at 100%. Those percentages indicate mapped specification points on Forge's selected route, not depth, exam performance, or quality of every item.
- `npm run check` passed on 3 October. The content audit still has pinned warnings: **296 cases where the correct option is much shorter than the distractors**, one duplicate option text, one recycled distractor, and 1,262 longest-answer cues among 15,327 audited answer positions. Passing means the counts have not exceeded the existing baselines, not that the warnings are resolved.
- `npm run check:e2e` exited successfully but **skipped** the coded-student deployed RLS journey because `FORGE_SERVICE_ROLE_KEY` is unavailable. Current local checks cannot prove the live class join, response saving, teacher read scope, or cleanup under deployed policies.
- In the local staging harness, a new student's Home offered one prominent Start practice action and three secondary actions. Practice then displayed the full 33-subject catalogue. GCSE Geography topic selection showed internal codes such as `GCSE-GEO-HAZ` and abbreviated paper codes. The question screen offered a clear count, save message, free quota, and topic details. Revision offered an eight-card daily set, typed recall, hints/choices, personal cards, and a subject picker; its default for the free test account was A Level Economics, regardless of the student's intended pilot subject.
- The staging harness uses fictional student data and a save-failure mode. Teacher functionality was reviewed from source and tests because the local teacher screen required sign-in. No pupil records, deployed teacher dashboards, native apps, or production analytics were inspected. A screenshot taken immediately after a practice transition showed old and new panels overlapping; because it was captured during a transition, that is **not** counted as a confirmed layout defect.
- The application event stream is currently dormant on app pages during school data-use review (`docs/product/analytics.md`). Pilot evaluation therefore needs agreed, proportionate reporting from authorised learning records and direct observation, not an assumption that product events are available.

## Current product assessment

| Area | What works | Main limitation for this pilot |
|---|---|---|
| Learning loop | Specific wrong-answer scaffolds, similar questions, Anvil repair, and a teacher starter link form a coherent path from error to action. | The local tests establish code behaviour, while delayed learning and classroom benefit still need observation with these pupils. |
| Student entry | Home has a clear first action and the practice session is short. Navigation labels now describe tasks in plain language. | All 33 subjects appear at the first free-student choice, and topic cards expose internal codes. The student's class or chosen subject is not always the starting context. |
| Revision | Due scheduling, free recall, hints, personal cards, and teacher-set revision exist. | Revision is a separate destination and is not yet the obvious next step on Home; new users see a ready queue that includes unseen material, which needs clearer explanation. |
| Teacher use | Assignments, class progress, misconception priorities, starter activities and revision reporting are implemented. | The pilot teacher journey and live permissions have not been independently exercised in this review. Sparse class data needs careful denominators and teacher validation. |
| Content | Extensive specification mapping and automated structural checks support rapid coverage. | 98.8% of questions are multiple choice, and the pinned cue warnings show remaining item-writing work. A Level Geography is still marked developing. |
| Trust and delivery | Shared API/writer boundaries, visible save failure states, server free quota, and a broad regression suite are present. | The live coded-student E2E gate skips locally; analytics is intentionally paused on app pages; native shells and deployed migrations were not verified here. |

## Comparison with student alternatives

| Student job | Seneca | Up Learn | Gizmo | Forge now | Implication for Forge |
|---|---|---|---|---|---|
| Know what to study next | Curriculum courses, adaptive question selection, revision planner, wrong-answer mode (some modes are paid) | Diagnostic, sequenced lessons, progress and knowledge refresh | Due flashcards from a spaced repetition queue | Home recommendation; teacher assignments; an eight-card Revision queue | Put class work, repair, and due revision into one clear daily next step. Persist a student's chosen subject. |
| Understand a difficult idea | Short course explanations and interactive activities | Specialist video lessons and worked exam answers | AI tutor and imported notes | Misconception scaffold plus a fresh similar question | Keep Forge's concise repair loop; improve explanations where pilot students still fail the similar question. |
| Recall over time | Adaptive revisit and wrong-answer practice | Refresh Knowledge and Strengthen | Spaced repetition, student-created cards and varied card types | Spaced Revision, typed recall, hints, choices, and student-made cards are present | Measure delayed repair and queue return. Do not describe Revision as still unbuilt. |
| Prepare for exam responses | Exam questions and papers vary by plan | Examiner-reviewed papers, mark schemes, exam technique and self-marking | Practice tests include written answers | Mostly multiple choice; small short/extended-answer inventory and timed practice | Add carefully reviewed data, diagram and written-answer tasks for the pilot routes, after core reliability. |
| Support a class teacher | Assignments, reporting, reassignment and classroom tools | School dashboards, assignments and progress | Deck sharing and live games | Assignments, misconception heatmap, suggested starters, class progress and revision reporting | Make the top reteaching action trustworthy and easy to use during next-lesson planning. |

Sources: [Seneca school feature list](https://help.senecalearning.com/en/articles/13431366-detailed-feature-list-by-school-pricing-plan), [Seneca revision planner](https://help.senecalearning.com/en/articles/13972891-seneca-revision-planner-your-personalised-ai-study-plan), [Up Learn Economics course](https://uplearn.co.uk/economics), [Up Learn exam practice](https://help.uplearn.co.uk/en/articles/10521613-how-do-i-practise-exam-level-content), [Gizmo overview](https://help.gizmo.ai/en/articles/14472668-how-does-gizmo-work), [Gizmo practice test](https://help.gizmo.ai/en/articles/16310903-what-is-a-practice-test). These are vendor descriptions checked on 3 October 2026; plan availability and claims should be treated as vendor statements, not independently measured outcomes.

**Strategic reading:** Seneca wins on breadth and school workflow, Up Learn on guided depth and exam preparation, Gizmo on effortless repeated recall. Forge can win a narrower but valuable job: a teacher trusted diagnosis and repair loop for the exact ideas pupils are meeting in class. Broad feature parity would dilute that work during this pilot.

## Prioritised release plan

### P0 — verify the live class loop before expanding use

1. **Run the protected coded-student end-to-end journey against staging or the intended deployment.** Cover unique pupil codes, class join, Forge/Revision/Anvil/Crucible writes, assignment attribution, signed-in history, teacher reads, failed saves and deletion/cleanup. Record the deployed migration version and a dated result. Owner: engineering plus pilot owner. **Done when:** the test executes rather than skips, and a teacher can reconcile a disposable pupil's work across student and teacher views.
2. **Close the pilot operating record with the school's data lead.** Confirm which classes, subjects and devices are actually in scope; code distribution; who can see reports; end date; retention/deletion process; and whether social features are enabled. Use the existing DPIA evidence file as input. **Done when:** the record identifies the live configuration and a named route for incidents and deletion. This is an operational gate for expansion, not a reason to pause the already authorised classroom review.
3. **Run one observed task pass with 6–10 current users across GCSE Geography, GCSE/A Level Economics, and at least one individual-subject tester.** Ask them to join or return, open the work set for them, finish a question, find the explanation, revisit an error, and locate their progress. Capture hesitations, wrong turns and save uncertainty without recording sensitive answer text in general analytics. **Done when:** every task has completion/time/help observations and the top three failure patterns are ranked.

### P1 — make today's relevant work immediate

4. **Create a class and subject aware entry path.** For a class student, show that class's subject and nearest assignment first. For an individual tester, remember their chosen subject and put it at the top on the next visit. Leave the full catalogue reachable through Browse all subjects. Remove internal bank IDs and cryptic paper abbreviations from student cards. **Done when:** a returning pilot student reaches the expected topic or assignment in at most two choices without scanning 33 subjects.
5. **Unify the daily recommendation.** Home should choose from due assignment, one active misconception to repair, due Revision, or a sensible new topic, with the reason in plain language. Revision must distinguish due cards from new cards and explain what its count means. **Done when:** a student can answer “what should I do now?” from the first screen, and an empty queue has a constructive next step.
6. **Resolve pilot access and quota edges.** Test whether the 10-question free limit interrupts individual subject testers or a Revision session. State what free, class and Pro students can do in ordinary language at the point of entry. Decide any pilot allowance from observed usage, then enforce it consistently on the server and in the UI. **Done when:** no assigned or promised pilot activity stops halfway because of an unexpected limit, and failed saves never look complete.

### P1 — prove educational quality in the four active routes

7. **Review a stratified sample of live Geography and Economics items with a teacher.** Sample each active bank, all known cue and duplicate warnings in those banks, recent student errors, explanations, and similar questions. Check exam-board fit, ambiguous answers, repeated stems, diagrams/data, fieldwork/case-study specificity and whether the similar question tests the same idea in a new context. Fix the highest-impact items first. **Done when:** every pilot bank has a dated review sample, an issue count and a clear owner; the duplicate option is removed; cue counts fall in pilot banks without raising baselines.
8. **Add a small set of exam-transfer tasks after the item review.** Begin with data interpretation and fieldwork decisions in Geography, and diagrams, calculations and short chains of reasoning in Economics. Include mark-point guidance and teacher reviewed exemplars. Avoid a broad AI marking launch during the pilot. **Done when:** each current class can complete at least one teacher reviewed non-MCQ task aligned to its taught unit and the teacher can use the result in planning.
9. **Measure repair that lasts.** Preserve the immediate similar-question result, then sample a fresh delayed check about a week later through Revision. Separate first-attempt accuracy, immediate repair, and delayed recall in the teacher view; show sample sizes so one pupil or one item is not presented as a class trend. **Done when:** the teacher can identify a common idea that still needs reteaching, with denominators and a clear route to the corresponding starter.

### P2 — refine after pilot evidence

10. **Simplify teacher next-lesson planning.** Make the top three misconceptions, affected pupils, sample size, linked starter and assignment follow-up one coherent flow. Verify against a real weekly planning session, including no-response and sparse-response classes.
11. **Tune Revision before enlarging it.** Check whether students return to due cards, whether the queue feels manageable after an absence, and whether typed recall, choices and personal cards are understood. Adjust schedule or language from observed use, not from competitor mimicry.
12. **Keep social and game features opt-in and secondary.** XP, leagues and class friends are present in the working tree, with teacher controls and code requirements. Test whether they improve participation without pressuring pupils or obscuring learning; review privacy and live policy deployment before switching them on more widely.
13. **Reduce maintainability drag in the largest page scripts.** The static architecture has shared API and scoring modules, but key journeys remain in large HTML scripts. Extract the most frequently changed student and teacher flows after their behaviour is stable, with checks that cover the real pilot paths.

## Suggested six-week pilot cadence

| When | Work | Decision evidence |
|---|---|---|
| Week 1 | Live security/save verification, class operating record, observed student tasks | No skipped live gate; ranked friction list |
| Weeks 2–3 | Subject aware entry, daily next step, quota and save clarity | Task completion and first-session starts improve |
| Weeks 3–4 | Geography/Economics item review and fixes, first exam-transfer tasks | Teacher sign-off on sampled items; warning counts improve |
| Weeks 5–6 | Delayed-repair reporting and teacher planning trial | Teacher can name and act on the top misconception; delayed checks expose recurrence |

### Small, interpretable pilot measures

- **Activation:** proportion of invited pupils who complete one saved practice set, by class/subject.
- **Independent return:** proportion who return in the following week without a new assignment, reported separately from teacher-set work.
- **Repair:** wrong answers with a similar-question attempt; fraction correct on that attempt; fraction correct on a later fresh check. Report numbers of students and items beside percentages.
- **Classroom action:** number of weeks the teacher used a Forge signal to choose a starter or follow-up, recorded in a lightweight teacher note.
- **Experience:** task success and help requests in observation; a brief student prompt on relevance, clarity and trust in saved progress.

Do not interpret these measures as grade improvement or causal impact. With small classes, use them to choose product fixes and classroom actions. Avoid public claims until the pilot design and results justify them.

## What to defer

Defer another wave of subjects, video-course parity, broad generative AI content/marking, and school-wide reporting expansion until the pilot loop is reliable and useful. Existing subject testers should still be supported; their chosen subject should be easier to enter and their feedback should determine which banks need review next.
