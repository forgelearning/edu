# Student UI/UX review — Forge, Gizmo and Up Learn

**Date:** 3 October 2026. Companion to the strategic
[product review](forge-review-2026-10-03.md), which covers pilot priorities,
content quality and live verification. This one is only about how easy Forge is
for a student to use.

**Evidence and limits.** Forge was walked through as a GCSE Geography class
student on the local staging server at desktop and phone width (Home, Practice,
a full session, Repair mistakes, Revision, Timed practice, Profile, the
mobile Menu). Gizmo and Up Learn were reviewed from their public sites, help
centres, App Store listing and published walkthroughs; neither was used
signed in, so their in-app details are as the vendors describe them.

## How the three are organised

| | Gizmo | Up Learn | Forge |
|---|---|---|---|
| **Mental model** | "My decks": pick a deck, press **Memorise** | "My course": a map of sections, work down it until every ring is green | Seven places to study: Practice, Revision, Repair mistakes, Timed practice, Assignments, Match pairs, My cards |
| **Main loop** | Memorise round → summary → "another round" | Video + quiz → section ring → **Strengthen** (wrong answers until right) → **Refresh Knowledge** (memory decay) | Practice set → explanation and similar question → Repair (3 in a row) → Revision (spaced) |
| **Progress** | Mastery % per deck; XP, level, league, streak | One **Up Score** (aim for 90%) and a red/amber/green ring per section | XP and rank (Home), accuracy and mistakes cleared (Profile), memory ledger (Revision), topic % (Practice), mastery bars (Revision topics) |
| **Getting in** | App store; one-tap Google/Apple sign-in; free | School account; paid by the school or family | Web app; name, class code and student code per device; native apps built but not yet in the stores |
| **Content** | Whatever the student imports (notes, slides, PDF, YouTube), turned into cards by AI | Specialist videos, quizzes and exam papers, A Level focused | Curated, specification-mapped questions with a named misconception behind each wrong answer |

**How easy is it to navigate?** Gizmo is the easiest because there is
essentially one verb: open a deck, Memorise. Everything else — tutor, live
games, friends, rewards — hangs off that. Up Learn is nearly as easy for a
different reason: it is a course, so "what next" is "the next amber ring".
Forge has the richest set of tools of the three but asks the student to choose
between them, and names some of them twice.

## Why students use Gizmo

From its own material, store reviews and how it is marketed, not from better
questions — its distractors are AI-generated and one store review reports
true/false questions where every answer is "true":

1. **It works on what their teacher actually taught.** Import the lesson
   slides or notes and the cards match the class, in any subject.
2. **It starts in seconds.** App store, one tap to sign in, free, and the first
   quiz is a tap away.
3. **It feels like a game on a phone.** Sounds, XP, streaks with freezes and
   repairs, leagues against friends, collectible monsters, a 2-minute speed run.
4. **It spreads socially.** TikTok, and friends playing Gizmo Live together.

Forge's advantage is the opposite of Gizmo's weakness: checked questions and a
diagnosis of *why* an answer was wrong. Its gap is friction and habit, not
quality.

## What works in Forge

- **Getting to a question is quick.** Home → Practice → Start practice: an
  eight-question set, about six minutes, with progress saving visibly.
- **Feedback on a wrong answer is the best of the three.** A named
  misconception, an explanation, a similar question to try, and "make a
  flashcard from this" — more targeted than Gizmo's Explain or Up Learn's quiz
  feedback.
- **Repair is honest and clear.** Three correct in a row clears an idea, with
  a visible 1-2-3 track. It is Up Learn's Strengthen with a better reason
  attached.
- **Revision is genuinely good recall practice.** Typed answers, a hint, show
  choices, self-rating that sets the return date, and the card's status on the
  card.
- **Social features are safe by design.** Classmates only, teacher switched,
  no messaging.

Fixed today along the way: Repair no longer shows the answer above the
question; hints in Practice, Repair and Revision; Revision shows only the
student's own subjects; Profile no longer shows codes or "1 fire"; Match pairs.

## What makes Forge harder than it needs to be

Ranked by how much each costs a student.

1. **No single loop.** Seven study destinations, each with its own rules,
   versus one in Gizmo and two in Up Learn. Home recommends a next step, but the
   end of a practice set offers five ways out and the main button is **Back to
   home** — the opposite of Gizmo's "another round".
2. **Revision is hidden on phones.** The bottom bar is Home, Practice, Repair,
   Assigned, Menu. Revision — the spaced-repetition habit that makes Gizmo
   sticky — and My progress are both behind Menu.
3. **Two vocabularies on the same screen.** Navigation says "Repair mistakes"
   and "Timed practice"; the pages and Home say "Anvil", "Crucible",
   "Re-forge", "Forge mode", "workbench", "fires", "topic bank". Around 100
   student-facing strings, mostly on Repair, Timed practice and Profile.
4. **Five progress numbers, none of which answers "how ready am I?".** XP,
   accuracy, mistakes cleared, a memory ledger and two different topic
   percentages live on four pages. Up Learn gives one score and a ring per
   section; Gizmo gives a mastery percentage per deck.
5. **Topic lists show internals.** Codes (`GCSE-GEO-HAZ`), abbreviations
   (`HAZ · Paper 1`) and staff copy ("FULL Complete live bank across the active
   specification"). The same topic is named three ways: "Hazardous Earth:
   tectonics", "Hazardous Earth — Tectonics" and "Hazardous Earth".
6. **Signing in is three fields on every new device**, on a web page rather
   than an installed app. Gizmo is one tap.
7. **Formats are siloed.** Multiple choice and fill-in-the-gap in Practice,
   typed recall in Revision, matching in its own section. Gizmo mixes multiple
   choice, typing, true/false, matching and ordering inside one round, which is
   a large part of why a round does not feel repetitive.

## What Gizmo has that Forge doesn't — and whether to follow

| Gizmo has | Follow? |
|---|---|
| Student's own content via AI import | **Not yet.** Teacher decks (parked) give the "matches my lesson" benefit with a teacher checking the content. AI import later, if at all. |
| App store presence and one-tap sign-in | **Yes.** The Capacitor apps exist; ship them. Remember the device; consider school Google or Microsoft sign-in after a DPIA review. |
| A daily habit loop (daily goal, streak freezes, sounds) | **Yes, partly.** A daily goal tied to Revision and a one-day streak freeze. No hearts, which punish mistakes. |
| Mixed formats in one round | **Yes.** Forge already has every format; put them in one session. |
| One mastery number per deck | **Yes**, as one per topic (see plan). |
| AI tutor and AI-generated distractors | **No.** Forge's curated explanations are its strength. |
| Collectible monsters, coins, shop | **No.** Cost without learning benefit in school use. |
| Public live games and following strangers | **No.** Forge's opt-in, classmates-only versions are the right shape for under-16s. |

## Plan

### Phase 1 — remove friction (each about a day; low risk)

1. **One student vocabulary.** Use the navigation's plain names everywhere a
   student reads: Practice, Repair mistakes, Timed practice, Revision. Remove
   Anvil, Crucible, Re-forge, Forge mode, workbench, fires and "bank" from
   student-facing text, including Profile's tabs and the sidebar subtitles.
   Keep the brand names in code and marketing if wanted. *Done when* a search
   of student-facing strings finds none.
2. **Put Revision in the phone tab bar.** Home, Practice, Revision, Repair,
   Menu; Assignments moves into Menu and stays prominent on Home whenever one is
   due (with its badge). *Done when* every daily activity is one tap from any
   page on a phone.
3. **Clean topic lists.** One canonical topic name everywhere (the catalogue
   label); no codes or paper abbreviations; replace staff copy with what the
   student gets ("35 questions · Paper 1").
4. **One next step at the end of a set.** The main button follows the state:
   repair this set's mistakes → due revision cards → another set in the same
   topic. "Done for now" is secondary. Fold the summary into one card.

### Phase 2 — one loop and one measure (3–5 days)

5. **A daily plan on Home.** Up to three steps chosen from due assignment, one
   mistake to repair and due revision cards, each with a tick; the streak counts
   days the plan is finished, with a one-day freeze. This becomes the habit
   loop.
6. **One topic mastery ring.** Red, amber or green per topic, combining
   first-attempt accuracy, cleared mistakes and secure revision cards, shown
   identically on Practice, Revision and Profile. Profile becomes a map of
   topics, like Up Learn's course page, instead of five separate statistics.
   XP and rank stay as motivation, not as the measure of readiness.
7. **Mixed sessions.** A practice set draws multiple choice, fill-in-the-gap
   and typed recall from the topic and ends with a short match round.

### Phase 3 — reach (larger)

8. **Ship the store apps** and use the installed local-notifications package
   for a daily "cards due" reminder (opt-in).
9. **Lighter sign-in.** Remember the device reliably; evaluate school Google
   and Microsoft sign-in with the data protection lead.
10. **Teacher decks** (designed, parked) so cards can match the lesson.

### Measuring it

Before Phase 1, run the observed task pass from the strategic review (6–10
pilot students: return, open set work, answer, find the explanation, repair a
mistake, find progress). Repeat after Phase 2. Track time to the first
question, steps to reach due revision, and whether students come back to due
cards the next day.

## Decisions for you

1. **Brand names.** Drop Anvil and Crucible from the student experience
   entirely (recommended), or keep one as a deliberate brand with an
   explanation?
2. **Phone tab bar.** Revision in, Assignments to Menu (recommended)?
3. **Readiness measure.** One mastery ring per topic (recommended), or
   something closer to Up Learn's single overall score?
