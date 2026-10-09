const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const win = {};
win.window = win;
vm.createContext(win);
vm.runInContext(fs.readFileSync('scripts/forge-report.js', 'utf8'), win);
const R = win.ForgeReport;
const json = (v) => JSON.parse(JSON.stringify(v));

// The payload: the base question (a similar question or a repair is reported
// against the question it twins), a bounded note, the chosen option.
let p = R.payload({ studentId: 's1', classCode: 'ABC', studentCode: 'X1Y2', studentName: 'Sam', question: { id: 'GEO-12-RF' }, bank: 'GEO', selected: 'B' }, 'two_answers', '  B looks right too  ');
assert.deepStrictEqual(json(p), { p_student_id: 's1', p_class_code: 'ABC', p_student_code: 'X1Y2', p_name: 'Sam', p_free_token: null,
  p_question_id: 'GEO-12', p_bank: 'GEO', p_reason: 'two_answers', p_note: 'B looks right too', p_selected_option: 'B' });
assert.strictEqual(R.payload({ studentId: 's', question: { id: 'Q-ANVIL' } }, 'typo', '').p_question_id, 'Q');
assert.strictEqual(R.payload({ studentId: 's', question: { id: 'Q-CHK' } }, 'typo', '').p_note, null, 'an empty note is null');
assert.strictEqual(R.payload({ studentId: 's', question: { id: 'Q' } }, 'other', 'x'.repeat(900)).p_note.length, 500);
assert.strictEqual(R.payload({ studentId: 's', question: { id: 'Q' }, selected: '<b>' }, 'other', '').p_selected_option, null);
assert.deepStrictEqual(json(R.REASONS.map((r) => r[0])), ['wrong_answer', 'two_answers', 'unclear', 'typo', 'other']);

// The migration: the same reasons, every kind of student verified, one report
// per student per question, a daily limit, a bounded note, nothing readable
// from the browser.
const sql = fs.readFileSync('supabase/migrations/20261009180000_question_reports.sql', 'utf8');
assert(sql.includes("reason in ('wrong_answer', 'two_answers', 'unclear', 'typo', 'other')"));
assert(sql.includes('unique (student_id, question_id)') && sql.includes('on conflict (student_id, question_id) do update'));
assert(sql.includes('public.forge_verify_class_student(') && sql.includes('auth.uid()') && sql.includes('v_student.free_token is distinct from p_free_token'));
assert(sql.includes(">= 20 then") && sql.includes("question_report_daily_limit"));
assert(sql.includes('length(note) <= 500'));
assert(sql.includes('revoke all on public.question_reports from public, anon, authenticated;'));
assert(sql.includes('alter table public.question_reports enable row level security;'));
assert(sql.includes('on delete cascade'), 'reports go with the student');
assert(/security definer\s+set search_path = ''/.test(sql));

// Wiring: offered after an answer in practice (both question types) and in
// Repair mistakes; free sessions send their token, class sessions their codes.
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert((quiz.match(/offerReport\(fb,q,/g) || []).length === 2);
assert(quiz.includes('freeToken:state.classId?null:(loadFreeSession()||{}).freeToken||null'));
const anvil = fs.readFileSync('pages/app/anvil.html', 'utf8');
assert(anvil.includes('ForgeReport.attach(fb,{studentId:anvilState.studentId'));
assert(fs.readFileSync('pages/marketing/privacy.html', 'utf8').includes('Report a problem'), 'the privacy policy describes reports');
console.log('Question report tests passed.');
