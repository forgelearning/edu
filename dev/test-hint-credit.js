#!/usr/bin/env node
/* Practice hints ("Rule out one option") are recorded as responses.hint_used.
   A hinted correct first attempt earns 5 XP instead of 10 and is not credited
   in accuracy; a hinted wrong answer is still a wrong answer. The rule lives in
   SQL (league, friends) and in several pages, so pin every copy of it here. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const read = (p) => fs.readFileSync(p, 'utf8');
const hinted = { question_id: 'Q', is_correct: true, reforge_attempted: false, hint_used: true };
const plain = { question_id: 'Q', is_correct: true, reforge_attempted: false };
const hintedWrong = { question_id: 'Q', is_correct: false, reforge_attempted: false, hint_used: true, misconception_tag: 'MC-X' };

// 1. Migration: column, write paths, XP and accuracy in SQL, overview payload.
const sql = read('supabase/migrations/20261003170000_responses_hint_used.sql');
assert(/add column if not exists hint_used boolean not null default false/.test(sql), 'adds hint_used, false for every existing row');
assert.strictEqual(sql.split('coalesce(p_hint_used,false)').length - 1, 2, 'both write RPCs store the flag');
assert.strictEqual(sql.split('p_reforge_attempted,p_reforge_correct,p_assignment_id,false').length - 1, 2, 'older signatures still work and record no hint');
assert.strictEqual(sql.split('then case when r.hint_used then 5 else 10 end').length - 1, 3, 'league (once) and friends (twice) give hinted answers 5 XP');
assert(/r\.is_correct and not r\.hint_used\)::int as correct/.test(sql), 'friends accuracy does not credit hinted answers');
assert(/'hint_used', hint_used/.test(sql), 'School Overview receives the flag');
assert(/grant execute on function public\.record_student_response_with_code\(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid,boolean\) to anon, authenticated/.test(sql));
assert(/grant execute on function public\.record_free_response\(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean\) to anon, authenticated/.test(sql));

// 2. Every client calcXP agrees: 5 for a hinted correct answer.
function calcFrom(file, name) {
  const src = read(file);
  const start = src.indexOf('function ' + name + '(');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src.slice(start, src.indexOf('\n}\n', start) + 2), ctx);
  return ctx[name];
}
[['pages/app/forge-quiz.html', 'calcXPFromResponses'], ['pages/app/student-dashboard.html', 'calcXP'], ['pages/app/profile.html', 'calcXP']]
  .forEach(([file, name]) => {
    const calc = calcFrom(file, name);
    assert.strictEqual(calc([hinted]), 5, file + ' gives a hinted answer 5 XP');
    assert.strictEqual(calc([plain]), 10, file + ' still gives an unhinted answer 10 XP');
    assert.strictEqual(calc([hintedWrong]), 0, file + ' gives a hinted wrong answer nothing');
  });
assert(/XP_HINTED = 5/.test(read('pages/app/forge-quiz.html')), 'the in-quiz award matches');

const leagueCtx = { window: {} }; leagueCtx.window = leagueCtx; vm.createContext(leagueCtx);
vm.runInContext(read('scripts/forge-league.js'), leagueCtx);
assert.strictEqual(leagueCtx.ForgeLeague.xpFor(hinted), 5, 'teacher league view agrees');

// 3. Accuracy credits only unhinted correct answers.
const metricsCtx = { window: {} }; vm.createContext(metricsCtx);
vm.runInContext(read('scripts/forge-metrics.js'), metricsCtx);
const acc = metricsCtx.window.ForgeMetrics.accuracy([plain, hinted, hintedWrong]);
assert.strictEqual(acc.total, 3, 'hinted answers still count as answered');
assert.strictEqual(acc.correct, 1, 'only the unhinted correct answer is credited');

// 4. A hinted wrong answer still opens its misconception.
const mcSrc = read('scripts/forge-misconception-state.js');
assert(/else if\(!row\.is_correct\)\{/.test(mcSrc), 'misconception evidence still keys on is_correct, not credit');

// 5. Writers send p_hint_used only when a hint was used, so unhinted answers
// do not depend on the migration.
const codeCtx = { window: {} }; codeCtx.window = codeCtx;
const sent = [];
codeCtx.ForgeAPI = { config: { key: 'anon' }, rpc: (name, payload) => { sent.push(payload); return Promise.resolve({ allowed: true }); } };
vm.createContext(codeCtx);
vm.runInContext(read('scripts/forge-student-code.js'), codeCtx);
(async () => {
  await codeCtx.ForgeStudentCode.recordResponse('s1', 'CODE', 'ABCDEFGH', { question_id: 'Q', is_correct: true });
  await codeCtx.ForgeStudentCode.recordResponse('s1', 'CODE', 'ABCDEFGH', { question_id: 'Q', is_correct: true, hint_used: true });
  assert(!('p_hint_used' in sent[0]), 'an unhinted answer sends no hint parameter');
  assert.strictEqual(sent[1].p_hint_used, true, 'a hinted answer sends p_hint_used');
  ['scripts/forge-response-writer.js', 'pages/app/forge-quiz.html'].forEach((file) => {
    assert(/if \(row\.hint_used\) freePayload\.p_hint_used = true;/.test(read(file)), file + ' sends the flag on the free path only when set');
  });
  console.log('Hint credit tests passed (SQL, client XP, accuracy, misconceptions, writers).');
})().catch((e) => { console.error(e); process.exit(1); });
