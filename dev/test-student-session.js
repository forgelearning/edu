#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const script = fs.readFileSync('scripts/forge-student-session.js', 'utf8');
const now = 1_800_000_000_000;

function start(entries) {
  const store = new Map(Object.entries(entries));
  const localStorage = {
    getItem: key => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
    get length() { return store.size; },
    key: index => Array.from(store.keys())[index] || null
  };
  const context = { localStorage, Date: { now: () => now }, addEventListener() {} };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(script, context);
  return { store, session: context.ForgeStudentSession };
}

const shared = start({
  'forge-student': JSON.stringify({studentCode:'PRIVATE-CODE'}),
  'forge-classes': JSON.stringify([{studentCode:'PRIVATE-CODE'}]),
  'forge-student-shared-device': '1',
  'forge-student-last-seen': String(now - 61 * 60 * 1000),
  'forge-auth-session': JSON.stringify({access_token:'secret'}),
  'forge-free-session': JSON.stringify({freeToken:'guest-secret'})
});
for (const key of ['forge-student','forge-classes','forge-auth-session','forge-free-session']) {
  assert.strictEqual(shared.store.has(key), false, `shared-device expiry must clear ${key}`);
}

const emailOnly = start({
  'forge-student-shared-device': '1',
  'forge-student-last-seen': String(now - 61 * 60 * 1000),
  'forge-auth-session': JSON.stringify({access_token:'secret'})
});
assert.strictEqual(emailOnly.store.has('forge-auth-session'), false, 'shared-device expiry still applies after email linking');

const personal = start({
  'forge-student': JSON.stringify({studentCode:'PRIVATE-CODE'}),
  'forge-student-last-seen': String(now - 24 * 60 * 60 * 1000)
});
assert.strictEqual(personal.store.has('forge-student'), true, 'personal device retains a recent class session');
console.log('Student session expiry tests passed.');
