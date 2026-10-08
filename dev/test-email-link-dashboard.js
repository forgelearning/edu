#!/usr/bin/env node
// Exercise the dashboard boot sequence without contacting Supabase.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const page = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
const start = page.indexOf('function renderAccountLoadError()');
const boot = page.slice(start, page.indexOf('</script>', start));

async function run(adoption, restoration, linkError = false) {
  const app = { innerHTML: '' };
  const calls = [];
  const context = {
    app,
    Promise,
    forgeEmailLinkAdoption: adoption,
    forgeEmailLinkError: linkError,
    ForgeAuthCard: { shell: (options, body) => options.title + ' ' + body },
    ForgeAuth: {
      hasSession: () => true,
      getSession: () => { calls.push('getSession'); return Promise.resolve(null); },
      restoreFreeStudent: () => restoration
    },
    document: { getElementById: () => ({ onclick: null }) },
    location: { reload() {} },
    checkLocalSessionProfile: () => calls.push('local profile'),
    renderLogin: () => calls.push('login')
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(boot, context);
  await new Promise(resolve => setImmediate(resolve));
  return { app, calls };
}

(async () => {
  let completeAdoption;
  const pending = new Promise(resolve => { completeAdoption = resolve; });
  const waiting = run(pending, Promise.resolve(null));
  completeAdoption(true);
  const adopted = await waiting;
  assert.deepStrictEqual(adopted.calls, [], 'dashboard must wait for link adoption and reload');

  const failedLink = await run(Promise.resolve(false), Promise.resolve(null));
  assert.match(failedLink.app.innerHTML, /email sign-in couldn’t be completed/);
  assert.deepStrictEqual(failedLink.calls, [], 'invalid link must not start normal dashboard loading');

  const consumedLink = await run(false, Promise.resolve(null), true);
  assert.match(consumedLink.app.innerHTML, /email sign-in couldn’t be completed/);
  assert.deepStrictEqual(consumedLink.calls, [], 'expired link must explain the error without reopening the login form');

  const failedProfile = await run(false, Promise.reject(new Error('temporary RPC error')));
  assert.deepStrictEqual(failedProfile.calls, ['getSession']);
  assert.match(failedProfile.app.innerHTML, /couldn’t load your account/);
  assert.doesNotMatch(failedProfile.app.innerHTML, /Sign in with email/);
  console.log('Email link dashboard boot tests passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
