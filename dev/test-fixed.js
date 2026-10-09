const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const win = {};
win.window = win;
vm.createContext(win);
for (const f of ['scripts/forge-fixed.js', 'scripts/forge-daily-plan.js', 'scripts/forge-misconception-state.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), win);
const F = win.ForgeFixed, P = win.ForgeDailyPlan, M = win.ForgeMisconceptions;
const json = (v) => JSON.parse(JSON.stringify(v));

const DAY = 86400000, now = Date.parse('2026-10-20T12:00:00Z');
const at = (daysAgo) => new Date(now - daysAgo * DAY).toISOString();
const row = (id, daysAgo, o) => Object.assign({ question_id: id, created_at: at(daysAgo), subject: 'econ', bank: 'B1', is_correct: true, reforge_attempted: false, reforge_correct: null, misconception_tag: null }, o);
const wrong = (id, tag, d) => row(id, d, { is_correct: false, misconception_tag: tag });
const reforged = (id, tag, d, ok) => row(id + '-RF', d, { reforge_attempted: true, reforge_correct: ok !== false, is_correct: ok !== false, misconception_tag: tag });
const check = (id, tag, d, ok) => row(id + '-CHK', d, { is_correct: ok !== false, misconception_tag: tag });

// Repaired eight days ago and not checked: due. Repaired three days ago: waiting.
let s = F.summarize([wrong('Q1', 'T1', 9), reforged('Q1', 'T1', 8), wrong('Q2', 'T2', 4), reforged('Q2', 'T2', 3)], now);
assert.deepStrictEqual(json(s.due.map((i) => i.tag)), ['T1']);
assert.deepStrictEqual(json(s.waiting.map((i) => i.tag)), ['T2']);
assert.strictEqual(s.nextDueAt, now - 3 * DAY + F.WAIT, 'the waiting idea is due a week after its repair');
assert.strictEqual(s.due[0].subject, 'econ', 'a due idea remembers its subject');

// A repair in Repair mistakes counts too.
s = F.summarize([wrong('Q3', 'T3', 10), row('Q4-ANVIL', 9, { misconception_tag: 'T3' })], now);
assert.deepStrictEqual(json(s.due.map((i) => i.tag)), ['T3']);
// A wrong Repair answer is not a repair.
assert.strictEqual(F.summarize([wrong('Q3', 'T3', 10), row('Q4-ANVIL', 9, { misconception_tag: 'T3', is_correct: false })], now).due.length, 0);

// A right check: fixed for good, no longer due. A wrong one: slipped, and the
// misconception is open again because the wrong check fires it.
s = F.summarize([wrong('Q1', 'T1', 9), reforged('Q1', 'T1', 8), check('Q5', 'T1', 0)], now);
assert.deepStrictEqual(json(s.fixed.map((i) => i.tag)), ['T1']);
assert.strictEqual(s.due.length, 0);
const slip = [wrong('Q1', 'T1', 9), reforged('Q1', 'T1', 8), reforged('Q1', 'T1', 8), reforged('Q1', 'T1', 8), check('Q5', 'T1', 0, false)];
s = F.summarize(slip, now);
assert.deepStrictEqual(json(s.slipped.map((i) => i.tag)), ['T1']);
assert.strictEqual(s.fixed.length, 0);
assert.deepStrictEqual(json(M.summarize(slip).active), ['T1'], 'a failed check reopens the misconception');

// Repaired again after slipping: due again a week later, and once passed it
// counts as fixed. Fixed stays counted when the idea later slips.
s = F.summarize(slip.concat([reforged('Q6', 'T1', -1)]), now + 9 * DAY);
assert.deepStrictEqual(json(s.due.map((i) => i.tag)), ['T1']);
s = F.summarize([wrong('Q1', 'T1', 30), reforged('Q1', 'T1', 29), check('Q5', 'T1', 20), wrong('Q7', 'T1', 10), reforged('Q7', 'T1', 9)], now);
assert.strictEqual(s.fixed.length, 1, 'ever fixed stays counted');
assert.deepStrictEqual(json(s.due.map((i) => i.tag)), ['T1'], 'a new repair needs its own check');

// Only an explicit check counts, never a check made before the week is up
// (that answer belongs to an earlier cycle) or ordinary practice.
assert.strictEqual(F.summarize([wrong('Q1', 'T1', 9), reforged('Q1', 'T1', 8), row('Q8', 1)], now).due.length, 1);
assert.strictEqual(F.baseId('GRO-01-CHK'), 'GRO-01');
assert.strictEqual(M.baseQuestionId('GRO-01-CHK'), 'GRO-01', 'misconception state strips the check suffix');

// Picking questions: one per due idea, never the question repaired, fresh
// when possible, stable, at most five, MCQ only.
const q = (id, tag, extra) => Object.assign({ id, tag, stem: id, options: { A: 'a', B: 'b' }, correct: 'A' }, extra);
const banks = { B1: { questions: [q('Q1', 'T1'), q('Q5', 'T1'), q('Q9', 'T1'), q('QF', 'T1', { type: 'fill_blank' }), q('Q2', 'T2')] } };
s = F.summarize([wrong('Q1', 'T1', 9), reforged('Q1', 'T1', 8), row('Q5', 30)], now);
let picks = F.pickQuestions(s.due, banks, [wrong('Q1', 'T1', 9), row('Q5', 30)]);
assert.deepStrictEqual(json(picks.map((p) => p.question.id)), ['Q9'], 'not the repaired Q1, not the answered Q5');
assert.deepStrictEqual(json(F.pickQuestions(s.due, banks, []).map((p) => p.question.id)), json(F.pickQuestions(s.due, banks, []).map((p) => p.question.id)), 'stable');
const many = Array.from({ length: 8 }, (_, i) => ({ tag: 'T' + i, repairedIds: {} }));
const wide = { B1: { questions: many.map((m, i) => q('X' + i, m.tag)) } };
assert.strictEqual(F.pickQuestions(many, wide, []).length, 5);
assert.strictEqual(F.href({ due: [{ subject: 'gcse-geo' }] }), 'forge-quiz.html?check=1&subject=gcse-geo');

// Today's plan offers the check, and ticks it once checks are done today.
let plan = P.build({ responses: [], fixesDue: 2, checkHref: 'forge-quiz.html?check=1&subject=econ', now: new Date(now) });
const step = plan.steps.find((x) => x.key === 'check');
assert(step && !step.done && /2 repaired ideas/.test(step.detail) && /check=1/.test(step.href));
plan = P.build({ responses: [check('Q5', 'T1', 0)], fixesDue: 0, now: new Date(now) });
assert(plan.steps.find((x) => x.key === 'check').done);
assert(!P.build({ responses: [], fixesDue: 0, now: new Date(now) }).steps.some((x) => x.key === 'check'), 'no step when nothing is due');

// Wiring: the quiz saves checks as -CHK with their tag and never resumes a
// check set as practice; Home, Repair and Profile show it; the badge counts it.
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(quiz.includes("state.check ? q.id + '-CHK' : q.id"));
assert(quiz.includes('misconception_tag: isReforge || state.check ?'));
assert(/function forgeSaveSession[^{]*\{\s*if \([^)]*state\.check\) return;/.test(quiz));
assert(/function forgeStartSession[\s\S]{0,140}state\.check = null;/.test(quiz), 'an ordinary set ends check mode');
for (const page of ['forge-quiz', 'student-dashboard', 'anvil', 'profile']) assert(fs.readFileSync('pages/app/' + page + '.html', 'utf8').includes('scripts/forge-fixed.js'), page + ' loads forge-fixed.js');
assert(fs.readFileSync('scripts/forge-achievements.js', 'utf8').includes("key: 'fixed', name: 'Fixed for good'"));
console.log('Fixed for good tests passed.');
