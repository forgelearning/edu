#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = new Map();
const context = {
  localStorage: {
    getItem(key) { return values.get(key) || null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('scripts/forge-study-mode.js', 'utf8'), context);
const mode = context.ForgeStudyMode;

assert.strictEqual(mode.isIndependent(), false);
assert.strictEqual(mode.set('independent'), false);
values.set('forge-free-session', JSON.stringify({ studentId: 'solo-1', freeToken: 'private-device-token', name: 'Alex' }));
assert.strictEqual(mode.isIndependent(), true, 'a free student starts independently');
values.set('forge-student', JSON.stringify({ studentId: 'class-1', classId: 'geo-class', studentName: 'Alex Smith' }));
assert.strictEqual(mode.isIndependent(), false, 'joining a class starts in class mode without erasing solo access');
assert.strictEqual(mode.set('independent'), true);
assert.strictEqual(mode.isIndependent(), true, 'the student can return to private study');
assert.strictEqual(mode.freeSession().studentId, 'solo-1');
assert.strictEqual(mode.classSession().studentId, 'class-1');
assert.strictEqual(mode.set('class'), true);
assert.strictEqual(mode.isIndependent(), false);
assert.strictEqual(mode.set('other'), false, 'unknown modes cannot change the active context');
values.delete('forge-student');
assert.strictEqual(mode.isIndependent(), true, 'the independent session remains accessible when the class session expires');

for (const page of ['forge-quiz', 'revision', 'student-dashboard', 'profile', 'anvil', 'crucible']) {
  const source = fs.readFileSync('pages/app/' + page + '.html', 'utf8');
  assert(source.includes('scripts/forge-study-mode.js'), page + ' loads the shared study context');
}
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(quiz.includes('Study on my own'));
assert(quiz.includes('View independent study'));
assert(quiz.includes('ForgeStudentCode.join(code,studentCode,name)'), 'independent students can join a coded class');
console.log('Independent study and class switching tests passed.');
