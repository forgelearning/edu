#!/usr/bin/env node
/* Practice streak with a one-day freeze: one missed day does not break a
   streak, two do. Home and Profile use scripts/forge-streak.js; the friends
   list computes the same rule in SQL. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-streak.js', 'utf8'), ctx);
const S = ctx.ForgeStreak;
const now = new Date(2026, 9, 10, 12);
const at = (daysAgo, hour) => ({ created_at: new Date(2026, 9, 10 - daysAgo, hour == null ? 10 : hour).toISOString() });
const calc = (rows) => { const r = S.calc(rows, now); return [r.days, r.frozen]; };

assert.deepStrictEqual(calc([]), [0, false]);
assert.deepStrictEqual(calc([at(0), at(1), at(2)]), [3, false], 'consecutive days');
assert.deepStrictEqual(calc([at(1), at(2)]), [2, false], 'practised yesterday, not yet today: still alive, not frozen');
assert.deepStrictEqual(calc([at(0), at(2), at(3)]), [3, false], 'one missed day is forgiven and not counted');
assert.deepStrictEqual(calc([at(0), at(3), at(4)]), [1, false], 'two missed days break the streak');
assert.deepStrictEqual(calc([at(2), at(3)]), [2, true], 'missed yesterday: the freeze keeps it, and says so');
assert.deepStrictEqual(calc([at(3), at(4)]), [0, false], 'missed two days: gone');
assert.deepStrictEqual(calc([at(0), at(0, 18), at(1)]), [2, false], 'several answers on one day count once');
// Local days, not UTC: 00:30 belongs to the day it was answered on.
assert.deepStrictEqual(calc([at(0, 0), at(1, 23)]), [2, false], 'just after midnight is today');

['pages/app/student-dashboard.html', 'pages/app/profile.html'].forEach((file) => {
  const src = fs.readFileSync(file, 'utf8');
  assert(src.includes('scripts/forge-streak.js'), file + ' loads the shared streak');
  assert(/function calcStreak\(responses\)\{ return window\.ForgeStreak \? ForgeStreak\.calc\(responses\)\.days : 0; \}/.test(src), file + ' uses it');
  assert(!/toISOString\(\)\.substring\(0,10\)/.test(src.slice(src.indexOf('function calcStreak'), src.indexOf('function calcStreak') + 400)), file + ' no longer groups by UTC date');
});
const sql = fs.readFileSync('supabase/migrations/20261004120000_friends_streak_freeze.sql', 'utf8');
assert(/d - lag\(d\) over \(partition by id order by d\) > 2 then 1/.test(sql), 'friends SQL starts a new run only after two missed days');
assert(/last_day >= v_today - 2/.test(sql), 'friends SQL keeps a streak alive through one missed day');
console.log('Streak tests passed (one-day freeze, frozen notice, local days, Home, Profile and friends SQL agree).');
