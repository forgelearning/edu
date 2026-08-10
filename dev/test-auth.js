#!/usr/bin/env node
// Dependency-free contract tests for the browser auth boundary.
// These tests mock fetch and localStorage; they never contact Supabase.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const store = new Map();
const calls = [];
const roleCalls = [];
const badgeCalls = [];

const localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  get length() { return store.size; },
  key: index => Array.from(store.keys())[index] || null
};

function response(status, body) {
  return { ok: status >= 200 && status < 400, status, text: () => Promise.resolve(body == null ? '' : JSON.stringify(body)) };
}

const context = {
  console,
  Date,
  Math,
  Promise,
  Object,
  JSON,
  String,
  Number,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  AbortController: undefined,
  localStorage,
  fetch: (url, options) => {
    calls.push({ url, options });
    if (url.includes('/rest/v1/subscribers') && calls.filter(c => c.url.includes('/rest/v1/subscribers')).length === 1) {
      return Promise.resolve(response(401, { message: 'JWT expired' }));
    }
    if (url.includes('/auth/v1/token?grant_type=refresh_token')) {
      return Promise.resolve(response(200, { access_token: 'access-new', refresh_token: 'refresh-new', user: { id: 'user-1' } }));
    }
    if (url.includes('/rest/v1/subscribers')) {
      return Promise.resolve(response(200, [{ id: 'sub-1', user_id: 'user-1', active: false, trial: true, trial_started_at: new Date().toISOString(), name: 'Mike' }]));
    }
    if (url.includes('/auth/v1/logout')) return Promise.resolve(response(204, null));
    throw new Error('Unexpected mocked request: ' + url);
  }
};
context.window = context;
context.ForgeRole = {
  clear: role => roleCalls.push(role),
  set: () => {}
};
context.ForgeSidebar = {
  setBadge: (key, value) => badgeCalls.push([key, value])
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'scripts/forge-api.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'public/forge-auth.js'), 'utf8'), context);

async function run() {
  store.set('forge-auth-session', JSON.stringify({ access_token: 'access-old', refresh_token: 'refresh-old', user: { id: 'user-1' } }));
  const session = await context.ForgeAuth.getSession();
  assert.strictEqual(session.access, 'trial', 'refresh path should return the subscriber access level');
  assert.strictEqual(session.session.access_token, 'access-new', '401 should replace the access token');
  assert.strictEqual(session.session.refresh_token, 'refresh-new', '401 should replace the refresh token');
  assert.ok(calls.some(call => call.url.includes('grant_type=refresh_token')), 'refresh endpoint should be called after a 401');

  store.set('forge-student', 'student-cache');
  store.set('forge-free-session', 'free-cache');
  store.set('forge-paid-student', 'paid-cache');
  store.set('forge-anvil-open', '2');
  store.set('forge-assigned-open', '3');
  store.set('forge-assigned-open-current', '3');
  store.set('forge-assigned-open:old-student:old-class', '3');
  store.set('forge-assignment-seen:old-student:old-class', '["a1"]');
  store.set('forge-notification-state:old-student:old-class', '{}');
  context.ForgeAuth.signOut();
  assert.strictEqual(context.ForgeAuth.hasSession(), false, 'sign out should remove the auth session');
  assert.strictEqual(store.has('forge-anvil-open'), false, 'sign out should clear derived Anvil state');
  assert.strictEqual(store.has('forge-assigned-open:old-student:old-class'), false, 'sign out should clear per-student assignment state');
  assert.strictEqual(store.has('forge-notification-state:old-student:old-class'), false, 'sign out should clear per-student notification state');
  assert.deepStrictEqual(roleCalls, ['student'], 'sign out should clear the student role');
  assert.deepStrictEqual(badgeCalls, [['anvil', null], ['assignments', null]], 'sign out should clear sidebar badges');

  assert.strictEqual(await context.ForgeAuth.getSession(), null, 'missing session should be a safe no-op');
  console.log(`Forge auth contract tests passed (${calls.length} mocked requests).`);
}

run().catch(error => { console.error(error.stack || error); process.exit(1); });
