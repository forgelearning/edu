#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../pages/app/teacher.html'), 'utf8');
const start = source.indexOf('var teacherHomeCache = null;');
const end = source.indexOf('function forgeSyncWidgetClasses(', start);
assert(start >= 0 && end > start, 'teacher home functions should be present');

const classes = new Set();
const pending = [];
const drawn = [];
let loadingCount = 0;
let replacedHistory = 0;
let classLabel = '';
const app = {
  classList: {
    add(name) { classes.add(name); },
    remove(name) { classes.delete(name); },
    contains(name) { return classes.has(name); }
  }
};
const context = {
  app,
  currentTeacher: { id: 'teacher-1' },
  dashState: { classId: null, className: null, classSubject: null, classCode: null },
  document: { title: '' },
  ForgeApp: { loading() { loadingCount += 1; } },
  ForgeSidebar: { setClassLabel(label) { classLabel = label; } },
  window: { location: { href: 'teacher.html' }, history: { replaceState() { replacedHistory += 1; } } },
  getJoinedClasses() { return []; },
  supaGet() { return new Promise((resolve, reject) => pending.push({ resolve, reject })); },
  drawTeacherHome(rows) { drawn.push(rows.map(row => row.id).join(',')); },
  forgeSyncWidgetClasses() {},
  setTeacherTitle(title) { context.document.title = title; }
};
context.window.ForgeSidebar = context.ForgeSidebar;
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

function flush() { return new Promise(resolve => setImmediate(resolve)); }

(async function () {
  context.renderTeacherHome();
  assert.equal(loadingCount, 1, 'first visit shows a loading state');
  pending.shift().resolve([{ id: 'class-1', name: 'Class 1', subject: 'econ', code: 'ABC' }]);
  await flush();
  assert.deepEqual(drawn, ['class-1']);

  context.dashState.classId = 'class-1';
  app.classList.remove('teacher-home-view');
  context.renderTeacherHome();
  assert.equal(loadingCount, 1, 'returning to classes does not flash a loading state');
  assert.deepEqual(drawn, ['class-1', 'class-1'], 'cached classes draw synchronously');
  assert.equal(context.dashState.classId, null);
  assert.equal(classLabel, 'Choose a class');
  assert.equal(replacedHistory, 1);

  pending.shift().resolve([{ id: 'class-1', name: 'Class 1', subject: 'econ', code: 'ABC' }]);
  await flush();
  assert.equal(drawn.length, 2, 'unchanged refresh does not rebuild the grid');

  context.renderTeacherHome();
  pending.shift().resolve([{ id: 'class-1', name: 'Renamed class', subject: 'econ', code: 'ABC' }]);
  await flush();
  assert.equal(drawn.length, 4, 'changed class details refresh the cached grid');

  context.renderTeacherHome();
  context.dashState.classId = 'class-1';
  app.classList.remove('teacher-home-view');
  pending.shift().resolve([{ id: 'class-2', name: 'Class 2', subject: 'econ', code: 'XYZ' }]);
  await flush();
  assert.equal(drawn.length, 5, 'late refresh does not replace an opened class');
  console.log('Teacher class-list return tests passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
