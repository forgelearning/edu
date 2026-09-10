# Daily Review — Phase 1 spec

Status: proposed, not built. Written 2026-09-10 after students asked for
flashcard-style revision and several started using Gizmo alongside Forge.

## The problem

Forge is reactive. It responds well when a student practises, but it never
calls them back. Practice, Anvil and Crucible all require the student to
arrive already intending to work, and to choose a topic. Nothing tells them
what to do on a Tuesday evening with no assignment set.

That is the whole of what Gizmo sells: a queue of cards due today, so the
decision of what to study is already made.

## What already exists

`buildWeightMap()` in `pages/app/forge-quiz.html` is a three-bucket
approximation of spaced repetition:

| Condition | Weight |
|---|---|
| 3+ correct, never wrong | 0.2 |
| wrong within last 7 days | 3 |
| wrong, longer ago | 2 |

It biases question *selection* inside a session the student has already
chosen to start. It has no intervals, no due dates, and no concept of a
queue. This spec replaces it.

Response history is already persisted server-side for all three kinds of
student, which is what makes the rest of this cheap:

| Student | Fetched by |
|---|---|
| Free (device token) | `ForgeClasses.fetchFreeResponses` |
| Class code | `ForgeClasses.fetchLinkedResponses` |
| Signed-in account | `ForgeClasses.fetchAuthResponses` |

## Scope

In scope: a scheduler, a due queue, a review session, and the surfaces that
show a student what is waiting.

Explicitly not in scope for Phase 1:

- student-authored cards or imported notes (Phase 3)
- streaks and daily targets (Phase 4, and see the note at the end)
- four-point self-grading (needs storage — see "Why binary" below)
- teacher-facing retention reporting (worth doing, but after this lands)

## No migration required

`responses` already stores `question_id`, `is_correct` and `created_at` per
answer. A Leitner schedule is a pure function of that history, so Phase 1
derives the schedule client-side at load, exactly where `buildWeightMap`
runs today. Nothing is written, so there is no new table, no RLS policy and
no migration to review.

This is the main reason to do the binary version first. Persisting a
schedule only becomes necessary when the student's *self-assessment*
carries information the response row cannot — which is Phase 2's
Again/Hard/Good/Easy, not this.

## The scheduler

### Deriving box state

Replay a student's responses for one question in chronological order.
Exclude, matching the existing engine's rules:

- rows where `reforge_attempted` is true — the twin is a teaching move, not
  an independent test of the same item
- `-RF` and `-CRU` suffixed ids, normalised back to their parent id
- questions whose id no longer appears in any live bank. Retired banks leave
  orphan rows in `responses`; Anvil already carries this bug class and its
  comment at `anvil.html:98` is the precedent

Then:

```
box = 0
for each response, oldest first:
    box = response.is_correct ? min(box + 1, 5) : 0
lastSeen = timestamp of most recent response
due = lastSeen + INTERVAL[box]
```

### Intervals

| Box | Interval | Meaning |
|---|---|---|
| 0 | 1 day | just got it wrong |
| 1 | 3 days | |
| 2 | 7 days | |
| 3 | 16 days | |
| 4 | 35 days | |
| 5 | 90 days | effectively retired for the year |

Roughly 2.2x growth. A question answered correctly from first sight
resurfaces about eight times across a 40-week course; one that keeps being
missed returns tomorrow, every time, until it sticks.

These belong in one exported constant, not scattered. They will need tuning
against real data after a term, and that tuning should be a one-line change.

### Wrong answers reset to box 0

Not box-1. A student who has met a question four times and still gets it
wrong has not "slipped one level" — the mental model is wrong and needs
rebuilding, which is the same premise Anvil is built on. Simpler to explain
to a student, too.

### The queue

1. Take every question where `due <= end of today, local time`.
2. Sort most-overdue first, then lowest box first.
3. **Cap at 20 per day.**

The cap is the important part. A student who is away for three weeks comes
back to 200 due items, and an uncapped queue is what makes people abandon
Anki. Overflow simply stays due; it does not compound or penalise.

If fewer than 20 are due, top up from unseen questions in the student's
weakest bank, reusing `recommendedBankForSubject()`. Label the two groups
distinctly in the UI — "due for review" and "new" — so the student can see
that a short queue is a good sign rather than a broken one.

### Show the interval

After each answer, state when the question returns: "Next review: 7 days",
with the box as "Box 3 of 5".

This is a deliberate difference from Gizmo, whose scheduling is a black box
— reviewers single that out as its main weakness. It costs nothing here,
and it teaches the student something true about how memory works, which a
revision tool aimed at a school ought to do.

## Surfaces

**Sidebar.** A sixth student item, `{key:'review', href:'review.html',
label:'Review'}`, added to the five in each student page's
`ForgeSidebar.mount`. The badge infrastructure already exists —
`scripts/forge-student-badges.js` sets `ForgeSidebar.setBadge`; point it at
the due count.

**Student dashboard.** A "Due today" card above the existing tiles, showing
the count, the subjects it spans, and a start button. When nothing is due,
say so plainly and name the next date rather than hiding the card.

**The session itself.** Extend `forge-quiz.html` with a review session type
rather than building a separate page.

That is the less appealing option — `forge-quiz.html` is already the
largest page in the app — but the answer-recording, Reforge and quota paths
must behave identically to normal practice, and duplicating them into a new
page guarantees they drift apart. Build the queue as its own module and
have the existing session runner consume it.

## Edge cases

| Case | Behaviour |
|---|---|
| No history at all | No queue. Say "review unlocks once you've practised" and link to practice, rather than showing an empty state |
| Question retired from the bank | Skipped when deriving; never queued |
| Question moved between banks | Unaffected — schedule is keyed on `question_id`, which survived the Hazardous Earth split |
| Coverage clones (`-COV-`) | Treated as their own items; they are distinct questions a student can be shown |
| Timezone | "Today" ends at local midnight. A UK student answering at 23:00 must not be handed tomorrow's queue |
| Free student, second device | Schedule is keyed to the device token, so it does not follow them. Pre-existing limitation of free accounts; worth stating in the UI, not fixing here |

## The free-tier collision

`FREE_DAILY_LIMIT = 10` in `forge-quiz.html:601` conflicts directly with a
20-card queue: a free student hits the wall halfway through and is asked to
pay mid-review, which is the worst possible moment for it.

Three options:

1. Review counts toward the 10 — simplest, and makes the feature useless for
   the students who asked for it.
2. Review is exempt — best experience, weakens the Pro proposition.
3. Review gets its own separate daily allowance.

**Recommended: 3.** A free student gets 10 practice questions and a capped
review queue, because reviewing what you have already answered is a
different thing from consuming new content. This needs a product decision
before build, not during.

Note also that the quota lives in `localStorage` and is trivially reset by
clearing site data. That is already true today; it is not a reason to
design around, but it is a reason not to build anything load-bearing on it.

## Testing

The scheduler is a pure function of `(responses, now)`, which makes it the
first genuinely algorithmic thing in the codebase and the first that can be
tested properly without a browser.

`dev/test-review-scheduler.js`, wired into `npm run check`, asserting at a
fixed clock:

- a question answered correctly three times in a row lands in box 3 with the
  right due date
- one wrong answer at box 4 returns it to box 0 and due tomorrow
- reforge rows and `-RF` ids do not advance the box
- an id absent from every live bank is never queued
- a 200-item backlog yields exactly 20, most-overdue first
- a queue built at 23:00 local time and one built at 00:30 the next day
  differ — the timezone case, which is the one most likely to be got wrong
  and least likely to be noticed

## Effort

Roughly, assuming no surprises:

| Piece | Size |
|---|---|
| Scheduler module + tests | small |
| Queue builder, cap, top-up | small |
| Session integration in `forge-quiz.html` | medium — the risk sits here |
| Dashboard card + sidebar badge | small |
| Interval display in the answer footer | small |

## A note on Phase 4

Streaks are deliberately excluded. Reviews of Gizmo report that its
game mechanics push students to complete sessions "fast and shallow to keep
the number alive", and that a missed day reads as a loss.

For a tool a school hands to students, a weekly target is a better fit than
a daily streak: it survives a day off, a school trip and illness without
teaching a child that they have broken something. Worth deciding
deliberately rather than inheriting the pattern because every other app has
it.
