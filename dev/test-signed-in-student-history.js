#!/usr/bin/env node
/* A signed-in student's own history must reach their Profile and Dashboard.
 *
 * Two independent faults each produced "all zeros" for a student who had
 * answered hundreds of questions:
 *
 *   1. the account was resolved to ONE student row
 *      (auth_user_id=eq.<uid>&order=created_at.asc&limit=1), but an account
 *      holds one row per class it joins and the oldest is the empty row made
 *      at sign-up;
 *   2. `responses` was read through the anon publishable key, and anon has no
 *      SELECT policy on that table — so the read answered 200 with [] instead
 *      of failing, and every surface rendered it as "nothing answered yet".
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const classes = fs.readFileSync(path.join(root, 'scripts', 'forge-classes.js'), 'utf8');

// ---- the helper reads every row the account owns, with the access token ----
const window = { localStorage: { getItem: () => null, setItem: () => {} } };
const calls = [];
window.ForgeAPI = {
  get(table, query, options) {
    calls.push({ table, query, options });
    if (table === 'students') return Promise.resolve([{ id: 'empty-signup-row' }, { id: 'econ-row' }]);
    return Promise.resolve([{ id: 'r1', student_id: 'econ-row', is_correct: true }]);
  }
};
const ForgeClasses = new Function('window', classes + '\n;return window.ForgeClasses;')(window);

ForgeClasses.fetchAuthResponses('token-abc', 'uid-1', function (rows, error, ids) {
  assert.strictEqual(error, null, 'a successful read reports no error');
  assert.strictEqual(rows.length, 1, 'responses from any of the account\'s rows are returned');
  assert.deepStrictEqual(ids, ['empty-signup-row', 'econ-row'], 'every student row the account owns is resolved');

  const students = calls.find((c) => c.table === 'students');
  const responses = calls.find((c) => c.table === 'responses');
  assert(!/limit=1/.test(students.query), 'resolving the account must not stop at one student row');
  assert.strictEqual(students.options.token, 'token-abc', 'the student lookup uses the access token');
  assert.strictEqual(responses.options.token, 'token-abc', 'the response read uses the access token, not the anon key');
  assert(/student_id=in\.\(empty-signup-row,econ-row\)/.test(responses.query), 'responses are read across all of the account\'s rows');
});

// ---- neither page may go back to the single-row, anon-key read ----
['profile.html', 'student-dashboard.html'].forEach(function (page) {
  const src = fs.readFileSync(path.join(root, 'pages', 'app', page), 'utf8');
  assert(/ForgeClasses\.fetchAuthResponses\(/.test(src), page + ' must load a signed-in student\'s history through the shared helper');
  assert(!/auth_user_id=eq\.[^\n]*limit=1/.test(src), page + ' must not resolve the account to a single student row');
  assert(!/if \(token && authUser\)[\s\S]{0,400}supaGet\('responses'/.test(src), page + ' must not read responses with the anon key while signed in');
});

console.log('  ok   a signed-in student\'s history reaches the profile and dashboard');
