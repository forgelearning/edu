#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = new Map();
const calls = [];
let user = { id: 'account-1', email: 'alex@example.com' };
const localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
  get length() { return values.size; },
  key: index => Array.from(values.keys())[index] || null
};
const context = {
  localStorage, Promise, Date, JSON, URL,
  location: { href: 'https://forge.example/forge-quiz.html' },
  ForgeAPI: {
    config: { url: 'https://api.example', key: 'public-key' },
    auth: {
      sendEmailLink: (email, redirect) => { calls.push(['send', email, redirect]); return Promise.resolve({}); },
      verifyEmailCode: () => Promise.resolve({ access_token: 'access', refresh_token: 'refresh', user }),
      user: () => Promise.resolve(user),
      signOut: () => Promise.resolve()
    },
    rpc: (name, args, options) => {
      calls.push([name, args, options]);
      if (name === 'claim_free_student') return Promise.resolve({ linked: true });
      if (name === 'get_my_free_student') return Promise.resolve([{
        student_id: 'guest-row', student_name: 'Student', free_token: 'secure-guest-token'
      }]);
      throw new Error('Unexpected RPC: ' + name);
    }
  },
  ForgeStudyMode: { set: mode => { calls.push(['mode', mode]); return true; } },
  ForgeRole: { set: () => {}, clear: () => {} }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('public/forge-auth.js', 'utf8'), context);

async function run() {
  values.set('forge-free-session', JSON.stringify({ studentId: 'guest-row', freeToken: 'secure-guest-token', name: 'Student' }));
  await context.ForgeAuth.sendEmailLink('Alex@Example.com', true);
  assert.deepStrictEqual(calls[0], ['send', 'Alex@Example.com', 'https://forge.example/student-dashboard.html']);
  assert.strictEqual(JSON.parse(values.get('forge-free-claim-pending')).email, 'alex@example.com');
  await context.ForgeAuth.verifyEmailCode('Alex@Example.com', '12345678');
  assert.strictEqual(values.has('forge-free-session'), false, 'old device state is cleared before account restoration');
  const restored = await context.ForgeAuth.restoreFreeStudent();
  assert.strictEqual(restored.studentId, 'guest-row');
  assert.strictEqual(calls.filter(call => call[0] === 'claim_free_student').length, 1);
  assert.strictEqual(values.has('forge-free-claim-pending'), false);
  assert.strictEqual(JSON.parse(values.get('forge-free-session')).freeToken, 'secure-guest-token');

  // A different device has no guest token; email sign-in restores the account row.
  context.ForgeAuth.signOut();
  calls.length = 0;
  await context.ForgeAuth.verifyEmailCode('alex@example.com', '87654321');
  await context.ForgeAuth.restoreFreeStudent();
  assert.strictEqual(calls.some(call => call[0] === 'claim_free_student'), false);
  assert.strictEqual(calls.some(call => call[0] === 'get_my_free_student'), true);

  // An email left pending on a shared device must not claim guest work for
  // someone who signs in to a different account.
  context.ForgeAuth.signOut();
  values.set('forge-free-session', JSON.stringify({ studentId: 'other-guest', freeToken: 'another-secure-token' }));
  await context.ForgeAuth.sendEmailLink('other@example.com', true);
  calls.length = 0;
  await context.ForgeAuth.verifyEmailCode('alex@example.com', '12345678');
  await context.ForgeAuth.restoreFreeStudent();
  assert.strictEqual(calls.some(call => call[0] === 'claim_free_student'), false);

  // A magic link must finish storing the user before the dashboard continues.
  let reloads = 0;
  context.location.hash = '#access_token=link-access&refresh_token=link-refresh&type=magiclink';
  context.location.pathname = '/student-dashboard.html';
  context.location.search = '';
  context.location.reload = () => { reloads++; };
  context.history = { replaceState: () => { context.location.hash = ''; } };
  assert.strictEqual(await context.ForgeAuth.adoptHashSession(), true);
  assert.strictEqual(context.ForgeAuth.currentUser().id, user.id);
  assert.strictEqual(context.ForgeAuth.accessToken(), 'link-access');
  assert.strictEqual(reloads, 1);
  console.log('Student email account handoff tests passed.');
}
run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
