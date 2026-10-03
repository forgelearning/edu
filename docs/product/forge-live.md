# Forge Live — design

Status: **draft for review** (2026-10-03). Nothing here is built.

## What it is

A teacher runs a short quiz from the front of the room; students answer on
their own devices; the board shows how the class answered and names the
misconception behind the most common wrong answer. Every answer is saved like
normal practice, so a ten-minute starter also fills the teacher's misconception
heatmap and puts each student's mistakes into their Repair queue.

That last part is the reason to build it. Kahoot and Gizmo Live already do
live quizzes well; what they cannot do is turn the room's answers into
misconception evidence that persists after the lesson.

It extends **Class Mode** (`pages/app/present.html`), which already runs a
bank from the front of the room but has no student devices.

## What it deliberately is not

- **No speed points and no public individual leaderboard.** Speed scoring
  rewards guessing, and a ranked list on the board shames the students who most
  need the practice. The board shows the class's answers, not who gave them.
- **No new join codes.** Students are already in the class. A Live session
  belongs to a class, and a student who opens Forge sees "Your teacher has
  started a Live quiz — Join".
- **No new question content.** It uses existing multiple-choice questions.

## The lesson, step by step

**Teacher (board):**
1. Class Mode → **Run live with a class** → choose class, topic and length
   (5 or 10 questions).
2. **Lobby**: "18 of 27 joined", with first name and initial as each student
   arrives, so the teacher can chase who is missing.
3. **Question**: stem and options large on the board; a live counter
   "14 of 18 answered". Optional timer (off by default; 20s or 30s).
4. **Reveal** (teacher clicks, or automatic when everyone has answered or the
   timer ends): a bar per option showing how many chose it, the correct answer,
   and the misconception label for the most-chosen wrong answer with its
   explanation — the teaching moment: "11 of you chose B. That's the idea that
   magnitude goes up in equal steps of energy."
5. **Next**, until the end.
6. **Summary**: accuracy per question, the misconceptions that came up most,
   and one button to **set a Repair task** for them (uses existing
   assignments).

**Student (device):**
- Sees the stem and the options as large buttons; taps once. The first answer
  is final, as in practice.
- After the reveal: right or wrong, the explanation, and +XP.
- Joining late lands on the current question. Losing connection and coming
  back resumes where the class is.
- At the end: their own score only, and "2 ideas added to Repair mistakes".

## How it works

### Real-time: polling, not websockets

Coded students sign in with a class code and student code, not a Supabase
account, so they have no token. Supabase Realtime channels without a token are
public: anyone with the site's public key could listen in or send fake "reveal"
or answer messages. Forge has no supabase-js dependency either.

So v1 **polls** small RPCs:

- Each device asks `get_live_state(session, known_version)` every ~1.5s (with
  jitter). If nothing changed it gets `{unchanged: true}`; the payload is tiny
  and the lookup is by primary key.
- The board asks `get_live_progress` every ~1.5s for the answer count.

For a class of 30 that is roughly 20 small requests a second while a quiz runs.
Today's production scale is 27 classes and 160 students, so even several
concurrent quizzes are comfortable. Polling also survives school networks that
block websockets.

A later version can add a Realtime *broadcast* that only says "version changed"
(no content) so devices fetch immediately rather than on the next poll. The
state itself would still come only from the authorised RPC, so a spoofed
broadcast could at worst trigger an extra fetch.

### Data

New tables (RLS on, no direct grants; reachable only through functions, like
`student_friendships`):

| Table | Holds |
|---|---|
| `live_sessions` | `id`, `class_id`, `teacher_user_id`, `bank`, `question_ids text[]` (fixed at start), `current_index`, `phase` (`lobby`, `question`, `reveal`, `ended`), `question_started_at`, `timer_seconds`, `version int`, `created_at`, `ended_at` |
| `live_participants` | `session_id`, `student_id`, `joined_at`, `last_seen_at` |
| `live_answers` | `session_id`, `student_id`, `question_index`, `selected_option`, `answered_at`; unique on (session, student, index) |

One active session per class (partial unique index on `class_id` where
`ended_at is null`). Sessions auto-end after two hours.

Each answer is **also written to `responses`**, which is what feeds the
heatmap, the Anvil and the profile. See decision 1 for how.

### Functions

Students (same identity check as `record_student_response_with_code`):

- `get_active_live_session(student_id, class_code, student_code)` — is there a
  quiz to join?
- `join_live_session(...)`
- `get_live_state(..., session_id, known_version)` — **never returns the
  correct option while `phase = 'question'`**.
- `submit_live_answer(..., session_id, question_index, option)` — refused
  unless the session is in `question` phase at that index; refused if already
  answered; writes `live_answers` and `responses` in one transaction.

Teacher (`auth.uid()` must equal `classes.teacher_user_id`):

- `start_live_session(class_id, bank, question_ids, timer_seconds)`
- `advance_live_session(session_id, action)` — `start`, `reveal`, `next`, `end`;
  bumps `version`.
- `get_live_progress(session_id)` — participants, answer counts, and after the
  reveal the per-option distribution.

### Pages

- `present.html` gains the teacher's live controls (lobby, question, reveal,
  summary). Existing Class Mode stays as it is.
- New `pages/app/live.html` for students.
- Home and Practice check `get_active_live_session` on load and every 15s while
  open, and show a Join card when a quiz is running.

## Security and privacy

- **Class codes required.** A class whose students sign in by name only cannot
  run Live, exactly as Friends returns `codes_required`. Otherwise anyone who
  knows a classmate's name could answer as them, in front of the class.
- **No early answers from the server.** `get_live_state` omits the correct key
  until the reveal. The bank itself ships to the browser (as it does for
  practice), so a determined student could look an answer up; Live does not make
  that worse, and no points depend on speed.
- **Answers lock** at the reveal; the function rejects late or repeated answers.
- **Names on the board** appear in the lobby only, as first name and initial.
  Results on the board are anonymous counts.
- **DPIA.** Live shows student names on a shared screen and stores a new kind of
  record. The Year 10 pilot paperwork
  (`docs/year-10-pilot-dpia-evidence.md` and the DPO pack) should be updated
  before Live is used in the pilot.
- `dev/audit-supabase-security.js` gains checks that the three tables are not
  readable anonymously, that a student cannot answer for another, and that an
  answer after the reveal is refused.

## Decisions for you

1. **How Live answers count in teacher data.** Recommended: as normal scored
   answers (accuracy and misconceptions), with a new `responses.context` column
   set to `'live'` so teacher views can filter or label them. The alternative,
   a question-id suffix like Crucible's `-CRU`, breaks per-question statistics.
2. **Leaderboard.** Recommended: none — class accuracy on the board, own score
   on the device. Option: an opt-in "top 3" the teacher can switch on, like the
   weekly league.
3. **XP.** Recommended: the same 10 XP as a practice answer, no speed bonus.
4. **Timer.** Recommended: off by default, with 20s and 30s available.
5. **Question types.** Recommended: multiple choice only in v1; fill-in-the-gap
   later.

## Build plan

| Phase | Scope | Estimate |
|---|---|---|
| 1 — MVP | Migration (tables, functions, grants); teacher lobby → question → reveal → next in Class Mode; student `live.html`; polling; answers into `responses`; staging-server mocks; tests and security-audit checks | 3–4 days |
| 2 — Lesson-ready | Join card on Home and Practice; timer; end-of-quiz summary with "set a Repair task"; reconnect and late-join polish | 2 days |
| 3 — Optional | Realtime broadcast hint for lower latency; opt-in top 3; fill-in-the-gap questions | 1–2 days |

Phase 1 is usable in a lesson on its own. Testing needs two browser contexts
(board and device) against the staging server, then one real lesson with a
small class before wider use.

## Found while designing

Class Mode's reveal screen currently shows each question's internal id
(`GCSE-HAZ-34`) and raw misconception tag to the whole class
(`present.html`, `renderPresent`). Worth fixing regardless of Live: show the
readable label instead, as practice now does.
