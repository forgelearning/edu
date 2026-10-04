#!/usr/bin/env node
/* Class Challenge: fixed questions for the whole class, "how your class
   answered" after each answer, and results on the Class Mode board. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const read = (p) => fs.readFileSync(p, 'utf8');

const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(read('scripts/forge-challenge.js'), ctx);
const C = ctx.ForgeChallenge;

// Picking: ten multiple-choice questions, tagged ones first, no other shapes.
const qs = Array.from({ length: 30 }, (_, i) => ({ id: 'Q' + i, options: { A: 'a', B: 'b' }, correct: 'A', tag: i < 12 ? 'MC-' + i : undefined }))
  .concat([{ id: 'F1', type: 'fill_blank' }, { id: 'S1', type: 'short_answer' }]);
let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const picked = C.pickQuestions(qs, 10, rnd);
assert.strictEqual(picked.length, 10);
assert(picked.every((id) => /^Q\d+$/.test(id)), 'only multiple-choice questions');
assert(picked.every((id) => Number(id.slice(1)) < 12), 'tagged questions come first, so wrong answers name a misconception');
assert.strictEqual(new Set(picked).size, 10, 'no repeats');
assert(C.isChallenge({ challenge_question_ids: ['Q1'] }) && !C.isChallenge({ banks: '[]' }));

// Tally: each student's first attempt only; repair attempts and other questions ignored.
const rows = [
  { student_id: 's1', question_id: 'Q1', selected_option: 'B', is_correct: false, misconception_tag: 'MC-1', created_at: '2026-10-01T10:00' },
  { student_id: 's1', question_id: 'Q1', selected_option: 'A', is_correct: true, created_at: '2026-10-02T10:00' },
  { student_id: 's2', question_id: 'Q1', selected_option: 'A', is_correct: true, created_at: '2026-10-01T09:00' },
  { student_id: 's3', question_id: 'Q1', selected_option: 'A', is_correct: true, reforge_attempted: true, created_at: '2026-10-01T08:00' },
  { student_id: 's3', question_id: 'Q9', selected_option: 'B', is_correct: false, created_at: '2026-10-01T08:00' }
];
const t = C.tally(rows, ['Q1']);
assert.deepStrictEqual(JSON.parse(JSON.stringify(t.Q1)), { answered: 2, options: { A: 1, B: 1 }, tags: { 'MC-1': 1 } }, 'first attempts per student, repair rows and other questions ignored');

// Student panel: hidden under five, bars at five or more, nothing before answering.
const q = { options: { A: 'a', B: 'b' }, correct: 'A' };
assert(/3 more classmates have answered/.test(C.classAnswersHtml(q, { allowed: true, answered: 2, hidden: true })), 'under five: no breakdown, says how many more');
const shown = C.classAnswersHtml(q, { allowed: true, answered: 6, options: { A: 4, B: 2 } }, 'B');
assert(/6 people in your class have answered/.test(shown) && /67%/.test(shown) && /is-chosen/.test(shown) && /is-correct/.test(shown), 'breakdown with your answer and the correct one marked');
assert(/not available/.test(C.classAnswersHtml(q, { allowed: false, reason: 'answer_first' })), 'refusals are explained, not shown as empty bars');

// Progress counts the challenge's own questions, out of its length.
const pctx = { window: {}, BANKS: { B: { questionCount: 40 } } }; pctx.window = pctx; pctx.window.ForgeAssignmentBanks = pctx.BANKS; vm.createContext(pctx);
vm.runInContext(read('scripts/forge-assignment-progress.js'), pctx);
const P = pctx.ForgeAssignmentProgress;
const asg = { id: 'a1', banks: '["B"]', challenge_question_ids: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'] };
const ans = (id, ok) => ({ question_id: id, bank: 'B', is_correct: ok, assignment_id: 'a1', created_at: '2026-10-01T10:00' });
let pr = P.progress(asg, ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'].map((id) => ans(id, true)).concat([ans('X1', true)]));
assert.strictEqual(pr.total, 10, 'total is the challenge length, not eight per topic');
assert.strictEqual(pr.answered, 8, 'answers outside the challenge do not count');
assert(!pr.complete, 'eight of ten is not complete');
pr = P.progress(asg, ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'].map((id) => ans(id, true)));
assert(pr.complete, 'all ten answered completes it');

// SQL: the two privacy rules.
const sql = read('supabase/migrations/20261004150000_class_challenge.sql');
assert(/add column if not exists challenge_question_ids text\[\]/.test(sql));
assert(/'answer_first'/.test(sql), 'a student must answer before seeing the class');
assert(/if v_answered < 5 then/.test(sql), 'no breakdown under five');
assert(/distinct on \(r\.student_id\)/.test(sql), 'first attempt per student');
assert(/grant execute on function public\.get_challenge_answers\(text, text, text, text, uuid, text\) to anon, authenticated/.test(sql));

// Wiring.
const quiz = read('pages/app/forge-quiz.html');
assert(/':challenge:' \+ state\.challenge\.id/.test(quiz), 'a challenge keeps its own saved progress');
assert(/state\.challenge \? rawQs\.slice\(\)/.test(quiz), 'fixed questions in a fixed order');
assert((quiz.match(/state\.assignmentId ?= ?null; ?state\.challenge ?= ?null;/g) || []).length >= 4, 'leaving an assignment leaves the challenge');
assert(read('pages/app/assignments.html').includes("'&challenge='+encodeURIComponent(a.challenge_question_ids.join(','))"), 'Assignments passes the fixed questions');
const present = read('pages/app/present.html');
assert(present.includes('ForgeChallenge.tally(') && present.includes('ForgeChallenge.MIN_SHOWN'), 'Class Mode tallies and hides small counts');
assert(read('pages/app/teacher.html').includes('ForgeChallenge.pickQuestions('), 'the teacher fixes the questions when setting it');
console.log('Class Challenge tests passed (picking, tally, privacy, progress, SQL, wiring).');
