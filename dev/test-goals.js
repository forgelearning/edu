const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const store = {};
const win = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
win.window = win;
vm.createContext(win);
for (const f of ['scripts/forge-rewards.js', 'scripts/forge-streak.js', 'scripts/forge-goals.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), win);
const G = win.ForgeGoals;
const json = (v) => JSON.parse(JSON.stringify(v));

// Levels, and a gentle default for a student who has not chosen.
assert.deepStrictEqual(json(G.LEVELS.map((l) => l.xp)), [50, 100, 150]);
assert.strictEqual(G.get('s1').xp, 50, 'default goal is the lightest');
assert(G.set('s1', 'strong'));
assert.strictEqual(G.get('s1').xp, 150);
assert.strictEqual(G.get('s2').xp, 50, 'per student');
assert(!G.set('s1', 'nonsense'));
store['forge-goal:s1'] = 'x"><b>';
assert.strictEqual(G.get('s1').xp, 50, 'a tampered value falls back to the default');
// The top goal stays reachable on the free plan's 40 answers a day.
assert(G.LEVELS[G.LEVELS.length - 1].xp <= 40 * 10 / 2);

// XP rules match the rest of Forge: 10 right, 5 hinted, 20 similar question,
// 30 Repair or Timed, nothing for wrong answers; a check is a plain answer.
const now = new Date(2026, 9, 15, 15, 0); // Thursday 15 October 2026, local time
const at = (dayOffset, hour) => new Date(2026, 9, 15 + dayOffset, hour || 10).toISOString();
const r = (o) => Object.assign({ question_id: 'Q', is_correct: true, reforge_attempted: false, reforge_correct: null, hint_used: false, created_at: at(0) }, o);
const today = [r({}), r({ hint_used: true }), r({ question_id: 'Q-RF', reforge_attempted: true, reforge_correct: true }), r({ question_id: 'Q-ANVIL' }),
  r({ question_id: 'Q-CRU' }), r({ question_id: 'Q-CHK' }), r({ is_correct: false }), r({ question_id: 'Q-RF', reforge_attempted: true, reforge_correct: false })];
let p = G.progress(today, 100, now);
assert.strictEqual(p.today, 10 + 5 + 20 + 30 + 30 + 10);
assert(p.met && p.pct === 100 && p.toGo === 0);

// The week runs Monday to Sunday; days before Monday do not count.
const week = [r({ created_at: at(-3) }), ...Array.from({ length: 5 }, () => r({ created_at: at(-2) })), r({ created_at: at(-4) }), r({ created_at: at(1) })];
p = G.progress(week, 50, now);
assert.deepStrictEqual(json(p.days.map((d) => d.xp)), [10, 50, 0, 0, 0, 0, 0], 'Mon 10, Tue 50, last Sunday and tomorrow excluded');
assert.deepStrictEqual(json(p.days.map((d) => d.met)), [false, true, false, false, false, false, false]);
assert.strictEqual(p.metDays, 1);
assert.strictEqual(p.weekXp, 60);
assert(p.days[3].today && p.days[4].future && !p.days[2].future);
// On a Sunday the week still starts on the Monday before.
assert.strictEqual(G.progress([r({ created_at: new Date(2026, 9, 12, 9).toISOString() })], 50, new Date(2026, 9, 18, 20)).days[0].xp, 10);
// extraToday adds to today only.
assert.strictEqual(G.progress([], 50, now, 30).today, 30);

// Celebrated once a day.
assert(G.claimCelebration('s1', now));
assert(!G.claimCelebration('s1', now), 'not twice in one day');
assert(G.claimCelebration('s1', new Date(2026, 9, 16, 9)), 'again the next day');

// The card and the chip.
store['forge-goal:s3'] = 'steady';
const card = G.cardHtml('s3', week, now);
assert(card.includes('of 100 XP today') && card.includes('<strong>0 of 7</strong>'), 'shows today against the chosen goal and the week');
assert.strictEqual((card.match(/data-forge-goal=/g) || []).length, 3);
assert(/data-forge-goal="steady" aria-pressed="true"/.test(card));
assert(card.includes('Repairing a mistake earns 20–30 XP'));
assert(G.chipHtml(G.progress(today, 50, now)).includes('Goal met'));

// Wiring: Home shows the card beside Today's plan; practice shows the chip,
// from the loaded history only (logResponse appends new answers to it, so
// adding the page's XP as well counted every answer twice).
const home = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
assert(home.includes('scripts/forge-goals.js') && home.includes('ForgeGoals.cardHtml(st.studentId,responses)'));
assert(home.indexOf('ForgeGoals.cardHtml') > home.indexOf('dashboard-plan-slot'), 'the card follows Today\'s plan');
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(quiz.includes('scripts/forge-goals.js') && quiz.includes('h+=goalChipHtml();'));
assert(/function goalProgress\(\)[\s\S]{0,260}ForgeGoals\.progress\(state\.responseHistory, ForgeGoals\.get\(state\.studentId\)\.xp, new Date\(\)\)/.test(quiz), 'no double counting');
assert(/function setXPHistory\(responses\) \{[\s\S]{0,200}state\.historyLoaded = true;/.test(quiz));
assert(/function awardXP[\s\S]{0,1500}updateGoalChip\(\);/.test(quiz), 'the chip updates as XP is earned');
console.log('Daily goal tests passed.');
