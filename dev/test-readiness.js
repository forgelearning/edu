const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const win = {};
win.window = win;
vm.createContext(win);
for (const f of ['scripts/forge-misconception-state.js', 'scripts/forge-topic-mastery.js', 'scripts/forge-readiness.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), win);
const R = win.ForgeReadiness;

const DAY = 86400000, now = Date.parse('2026-10-20T12:00:00Z');
let n = 0;
const ans = (bank, ok, daysAgo, o) => Object.assign({ question_id: bank + '-' + (++n), bank, is_correct: ok, hint_used: false, reforge_attempted: false,
  reforge_correct: null, misconception_tag: null, created_at: new Date(now - daysAgo * DAY - n * 1000).toISOString() }, o);
const many = (bank, right, wrong, daysAgo) => [...Array.from({ length: right }, () => ans(bank, true, daysAgo)), ...Array.from({ length: wrong }, () => ans(bank, false, daysAgo))];
const score = (rows, banks, bank) => R.subject(rows, banks, now).topics.find((t) => t.bank === bank).score;

// Recent accuracy, scaled down until eight answers.
assert.strictEqual(score(many('A', 8, 2, 1), ['A'], 'A'), 80);
assert.strictEqual(score(many('A', 2, 0, 1), ['A'], 'A'), 25, 'two right answers are a quarter of the way, not 100');
assert.strictEqual(score([], ['A'], 'A'), 0);
// A hinted right answer is not credited.
assert.strictEqual(score(many('A', 10, 0, 1).map((r, i) => i < 5 ? Object.assign(r, { hint_used: true }) : r), ['A'], 'A'), 50);

// An open mistake costs 10; repaired, it costs nothing.
const wrongTagged = ans('A', false, 2, { misconception_tag: 'T1' });
const base = many('A', 9, 0, 1);
assert.strictEqual(score([wrongTagged, ...base], ['A'], 'A'), 80, '90% less 10 for the open mistake');
const repairs = [1, 2, 3].map(() => ans('A', true, 1, { question_id: 'X-RF', reforge_attempted: true, reforge_correct: true, misconception_tag: 'T1' }));
assert.strictEqual(score([wrongTagged, ...base, ...repairs], ['A'], 'A'), 90, 'cleared after three repairs');

// Fading: three weeks without practice, then six.
assert.strictEqual(score(many('A', 10, 0, 25), ['A'], 'A'), 85);
assert.strictEqual(score(many('A', 10, 0, 50), ['A'], 'A'), 70);
// Fixed for good adds 5 an idea, at most 10, and never past 100.
// (Checks are older than the ten answers scored, so only the bonus differs.)
const fixedRows = ['T1', 'T2', 'T3'].map((t) => ans('A', true, 3, { question_id: 'Y-CHK', misconception_tag: t }));
assert.strictEqual(score([...many('A', 8, 2, 1), ...fixedRows], ['A'], 'A'), 90);
assert.strictEqual(score([...many('A', 10, 0, 1), ...fixedRows], ['A'], 'A'), 100);

// The subject is the average over every topic, unstarted ones as 0.
let s = R.subject([...many('A', 10, 0, 1), ...many('B', 6, 4, 1)], ['A', 'B', 'C', 'D'], now);
assert.strictEqual(s.score, Math.round((100 + 60) / 4));
assert.strictEqual(s.started, 2);
assert.strictEqual(s.total, 4);
assert.strictEqual(s.band.label, 'Building', '40 is the first Building score');
assert.deepStrictEqual(JSON.parse(JSON.stringify([s.next.bank, s.next.why])), ['B', 'weak'], 'raise the weakest started topic first');
s = R.subject([...many('A', 10, 0, 1), ...many('B', 9, 1, 1)], ['A', 'B', 'C'], now);
assert.deepStrictEqual(JSON.parse(JSON.stringify([s.next.bank, s.next.why])), ['C', 'start'], 'then a topic not started');
s = R.subject(many('A', 8, 2, 30), ['A'], now);
assert.strictEqual(s.next.why, 'faded');
assert.deepStrictEqual([0, 39, 40, 69, 70, 89, 90, 100].map((x) => R.band(x).key), ['starting', 'starting', 'building', 'building', 'strong', 'strong', 'ready', 'ready']);

// The card says what it means.
const card = R.cardHtml(R.subject(many('B', 6, 4, 1), ['B', 'C'], now), { subjectName: 'GCSE <b>Geo</b>', label: (b) => 'Topic ' + b });
assert(card.includes('aim for 90%') && card.includes('1 of 2 topics started · 60% in those') && card.includes('Topic B'));
// Started topics' average is said beside the score, never instead of it, and
// not at all once every topic is started.
s = R.subject([...many('A', 10, 0, 1), ...many('B', 6, 4, 1)], ['A', 'B', 'C', 'D'], now);
assert.strictEqual(s.startedAvg, 80);
assert.strictEqual(s.score, 40);
assert(!R.cardHtml(R.subject(many('A', 10, 0, 1), ['A'], now)).includes('in those'));
assert.strictEqual(R.subject([], ['A'], now).startedAvg, null);
assert(!card.includes('<b>Geo'), 'subject name is escaped');
assert(card.includes('How it’s worked out'));

// Wiring: Home, Profile and the practice results show it.
const home = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
assert(home.includes('scripts/forge-readiness.js') && home.includes('ForgeReadiness.cardHtml(ForgeReadiness.subject(responses,readinessBanks)'));
const profile = fs.readFileSync('pages/app/profile.html', 'utf8');
assert(profile.includes('scripts/forge-readiness.js') && profile.includes('ForgeReadiness.subject(responses,topicBanks)'));
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(quiz.includes('h+=readinessResult;') && quiz.includes('state.readinessStart=subjectReadiness()'));
console.log('Readiness tests passed.');
