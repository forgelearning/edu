#!/usr/bin/env node
/* The profile showed zero answers for students with a full history. Two faults
   combined: renderProfile called resolveBankLabel, which the page stopped
   loading when it moved to forge-catalog.js, and fetchLinkedResponses caught
   the resulting exception and called back a second time with an empty list. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// 1. The profile defines the helper it calls (it no longer loads forge-data.js).
const profile = fs.readFileSync('pages/app/profile.html', 'utf8');
if (/resolveBankLabel\(/.test(profile)) {
  assert(/function resolveBankLabel\(/.test(profile) || /data\/forge-data\.js/.test(profile),
    'profile.html calls resolveBankLabel but neither defines it nor loads forge-data.js');
}

// 2. An exception in the caller's callback is not reported as an empty history.
const ctx = {
  console, Promise, setTimeout,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  ForgeStudentCode: { responses: () => Promise.resolve([{ id: 'r1', created_at: '2026-09-01' }, { id: 'r2', created_at: '2026-09-02' }]) }
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-classes.js', 'utf8'), ctx);

const calls = [];
process.on('unhandledRejection', () => {}); // the thrown render error surfaces here, as intended
ctx.ForgeClasses.fetchLinkedResponses('u', 'k', { studentId: 's', classCode: 'C', studentCode: 'ABCDEFGH', studentName: 'A' }, function (rows) {
  calls.push(rows.length);
  if (calls.length === 1) throw new Error('render bug');
});

// 3. A genuine read failure still calls back once with an empty list and the error.
const failing = [];
ctx.ForgeStudentCode.responses = () => Promise.reject(new Error('network'));
ctx.ForgeClasses.fetchLinkedResponses('u', 'k', { studentId: 's', classCode: 'C', studentCode: 'ABCDEFGH', studentName: 'A' }, function (rows, error) {
  failing.push([rows.length, error && error.message]);
});

setTimeout(() => {
  assert.deepStrictEqual(calls, [2], 'callback runs once with the rows, even if it throws');
  assert.deepStrictEqual(failing, [[0, 'network']], 'a failed read reports empty rows and the error');
  console.log('Profile render tests passed (helper defined, render errors not turned into empty history, read failures still reported).');
}, 50);
