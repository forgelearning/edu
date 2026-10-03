#!/usr/bin/env node
/* Weekly class league: the SQL's XP rules must match the dashboard's calcXP,
   and the renderer must stay quiet when there is nothing to show. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// 1. XP rules in the migration match calcXP in the dashboard.
const sql = fs.readFileSync('supabase/migrations/20260928120000_weekly_class_league.sql', 'utf8');
const expected = [
  /question_id like '%-ANVIL' then case when r\.is_correct then 30 else 0 end/,
  /question_id like '%-CRU' and r\.is_correct then 30/,
  /reforge_attempted and r\.reforge_correct then 20/,
  /is_correct and not coalesce\(r\.reforge_attempted, false\) then 10/
];
expected.forEach(re => assert(re.test(sql), 'league SQL missing XP rule ' + re));
const dash = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
const calc = dash.slice(dash.indexOf('function calcXP('), dash.indexOf('\n}\n', dash.indexOf('function calcXP(')) + 2);
const ctx0 = {}; vm.createContext(ctx0); vm.runInContext(calc, ctx0);
assert.strictEqual(ctx0.calcXP([{ question_id: 'Q-ANVIL', is_correct: true, reforge_attempted: true, reforge_correct: true }]), 30);
assert.strictEqual(ctx0.calcXP([{ question_id: 'Q-CRU', is_correct: true }]), 30);
assert.strictEqual(ctx0.calcXP([{ question_id: 'Q', is_correct: true, reforge_attempted: true, reforge_correct: true }]), 20);
assert.strictEqual(ctx0.calcXP([{ question_id: 'Q', is_correct: true, reforge_attempted: false }]), 10);
assert(/grant execute on function public\.get_class_weekly_league\(text, text, text, text\) to anon, authenticated/.test(sql));
assert(/revoke all on function public\.get_class_weekly_league/.test(sql), 'function must not stay executable by PUBLIC by default');

// 2. Renderer.
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-league.js', 'utf8'), ctx);
const L = ctx.ForgeLeague;
assert.strictEqual(L.html(null), '', 'no data, no league');
assert.strictEqual(L.html({ enabled: false }), '', 'switched off by the teacher, no league');
assert(L.html({ enabled: true, rows: [] }).includes('take first place'), 'empty week invites the first answer');
assert(L.teacherHtml([{ id: 'a', name: 'A' }], [], true).includes('forge-league__empty'), 'teacher view has a proper empty state');

const data = { enabled: true, ranked: 9, you: { position: 6, xp: 40 }, rows: [
  { seq: 1, position: 1, name: 'Jess B.', xp: 320, is_you: false },
  { seq: 2, position: 2, name: 'Sam <K.>', xp: 210, is_you: false },
  { seq: 3, position: 3, name: 'Ali R.', xp: 150, is_you: false },
  { seq: 4, position: 4, name: 'Mo T.', xp: 90, is_you: false },
  { seq: 5, position: 5, name: 'Ria P.', xp: 60, is_you: false },
  { seq: 6, position: 6, name: 'Alex N.', xp: 40, is_you: true },
  { seq: 8, position: 8, name: 'Ben C.', xp: 10, is_you: false }
] };
const h = L.html(data);
assert(h.includes('>You<') && !h.includes('Alex N.'), 'the caller is shown as You');
assert(h.includes('Sam &lt;K.&gt;'), 'names are escaped');
assert(h.includes('21 XP to overtake Ria P.<') && !h.includes('P..'), 'says how far to the next place, with one full stop');
assert((h.match(/forge-league__gap/g) || []).length === 1, 'marks the one gap in the list');
assert(L.html(Object.assign({}, data, { you: { position: 1, xp: 320 }, rows: [Object.assign({}, data.rows[0], { is_you: true })] })).includes('top of the class'));
assert(L.html(Object.assign({}, data, { you: null })).includes('join the league'), 'a student with no XP this week is invited, not ranked');

// 3. The shared xpFor (teacher view) agrees with calcXP row by row.
[
  { question_id: 'Q-ANVIL', is_correct: true, reforge_attempted: true, reforge_correct: true },
  { question_id: 'Q-ANVIL', is_correct: false, reforge_attempted: true, reforge_correct: false },
  { question_id: 'Q-CRU', is_correct: true },
  { question_id: 'Q', is_correct: true, reforge_attempted: true, reforge_correct: true },
  { question_id: 'Q', is_correct: true, reforge_attempted: false },
  { question_id: 'Q', is_correct: false, reforge_attempted: false }
].forEach(r => assert.strictEqual(L.xpFor(r), ctx0.calcXP([r]), 'xpFor matches calcXP for ' + JSON.stringify(r)));

// 4. Teacher view: this week only, full names, visibility status.
const monday = L.weekStart(new Date('2026-10-01T12:00:00'));
assert.strictEqual(monday.getDay(), 1, 'week starts on Monday');
const now = new Date('2026-10-01T12:00:00');
const t = L.teacherHtml(
  [{ id: 'a', name: 'Jess Best' }, { id: 'b', name: 'Mike' }, { id: 'c', name: 'Idle' }],
  [
    { student_id: 'a', question_id: 'Q1', is_correct: true, created_at: '2026-09-30T10:00:00' },
    { student_id: 'a', question_id: 'Q2', is_correct: true, created_at: '2026-09-20T10:00:00' },
    { student_id: 'b', question_id: 'Q3', is_correct: true, reforge_attempted: true, reforge_correct: true, created_at: '2026-09-29T10:00:00' }
  ], false, now);
assert(t.indexOf('Mike') < t.indexOf('Jess Best') && t.includes('20 XP') && t.includes('10 XP'), 'ranks this week only, highest first');
assert(!t.includes('Idle') && t.includes('2 of 3 students'), 'students with no XP are counted, not listed');
assert(t.includes('Hidden from students') && t.includes('switch the league on'), 'shows that students cannot see it');

// 5. A signed-in account has one student row per class; the page's studentId
//    may belong to another class. The class's own row must be used.
const calls = [];
const ctx2 = { ForgeAPI: { config: { key: 'anon' }, rpc: (name, body, opts) => { calls.push({ name, body, opts }); return Promise.resolve({}); } },
  ForgeAuth: { accessToken: () => 'user-token' },
  ForgeClasses: { list: () => [], load: () => [
    { classId: 'geo', classCode: 'GG-1', studentId: 'row-geo', studentName: 'Isaac N' },
    { classId: 'chem', classCode: 'CH-1', studentId: 'row-chem', studentName: 'Isaac' }] } };
vm.createContext(ctx2);
vm.runInContext(fs.readFileSync('scripts/forge-league.js', 'utf8'), ctx2);
ctx2.ForgeLeague.studentRpc('get_student_assignments', { studentId: 'row-chem', classId: 'geo', studentName: 'Isaac N' });
assert.strictEqual(calls[0].body.p_student_id, 'row-geo', 'uses the student row for the requested class');
assert.strictEqual(calls[0].body.p_class_code, 'GG-1', 'finds the class code from the saved classes, even under another name');
assert.strictEqual(calls[0].opts.token, 'user-token', 'a signed-in student sends their own token');

console.log('League tests passed (XP rules match calcXP, grants, hidden when off, escaping, overtake line, gaps).');
