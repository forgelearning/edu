#!/usr/bin/env node
// Failure-contract tests for the shared browser API boundary.
// These use mocked fetch responses and never contact Supabase.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const calls = [];
let mode = 'server-error';

function response(status, body) {
  return {
    ok: status >= 200 && status < 400,
    status,
    text: () => Promise.resolve(body == null ? '' : JSON.stringify(body))
  };
}

const context = {
  console,
  Promise,
  Object,
  JSON,
  String,
  Error,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  AbortController: undefined,
  fetch: (url, options) => {
    calls.push({ url, options });
    if (mode === 'server-error') return Promise.resolve(response(503, { message: 'database unavailable' }));
    if (mode === 'quota') return Promise.resolve(response(200, { allowed: false, reason: 'daily_limit', used: 10 }));
    return Promise.reject(Object.assign(new Error('network down'), { name: 'TypeError' }));
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'scripts/forge-api.js'), 'utf8'), context);

async function run() {
  await assert.rejects(
    context.ForgeAPI.rpc('record_free_response', { p_student_id: 'test' }),
    error => error.status === 503 && error.message === 'database unavailable',
    'server failures should preserve status and readable message'
  );

  mode = 'quota';
  const quota = await context.ForgeAPI.rpc('record_free_response', { p_student_id: 'test' });
  assert.deepStrictEqual(quota, { allowed: false, reason: 'daily_limit', used: 10 }, 'quota responses should reach the client unchanged');

  mode = 'network-error';
  await assert.rejects(
    context.ForgeAPI.rpc('record_free_response', { p_student_id: 'test' }),
    error => error.message === 'network down',
    'network failures should reject for the quiz recovery handler'
  );

  assert.strictEqual(calls.length, 3, 'each controlled failure should make one API request');
  console.log('Forge API failure-contract tests passed (503, quota rejection, and network failure).');
}

run().catch(error => { console.error(error.stack || error); process.exit(1); });
