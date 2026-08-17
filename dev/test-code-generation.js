#!/usr/bin/env node
/* Regression checks for the teacher's student-code dialog and assignment links. */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const teacher = fs.readFileSync(path.join(root, 'pages', 'app', 'teacher.html'), 'utf8');
const assignments = fs.readFileSync(path.join(root, 'pages', 'app', 'assignments.html'), 'utf8');
const quiz = fs.readFileSync(path.join(root, 'pages', 'app', 'forge-quiz.html'), 'utf8');

assert(!/window\.prompt\(/.test(teacher), 'student-code generation must not use a native prompt');
assert(/id="generate-codes-panel"/.test(teacher), 'teacher dashboard needs an inline code-generation panel');
assert(/aria-controls="generate-codes-panel"/.test(teacher), 'generate button must expose its controlled panel');
assert(/role="dialog"/.test(teacher) && /aria-labelledby="generate-codes-title"/.test(teacher), 'code panel needs dialog semantics');
assert(/id="student-code-quantity"/.test(teacher) && /min="1" max="200"/.test(teacher), 'quantity input needs an explicit bounded range');
assert(/Enter a whole number from 1 to 200/.test(teacher), 'invalid quantities need an inline error');
assert(/role="status" aria-live="polite"/.test(teacher), 'generation result needs an announced status region');
console.log('  ok   student-code generation uses an accessible inline dialog');

assert(/assignment_id=/.test(assignments), 'assignment links must carry their assignment id');
assert(/requestedAssignmentId/.test(quiz) && /state\.assignmentId/.test(quiz), 'quiz route must retain the assignment id');
assert(/p_assignment_id: row\.assignment_id \|\| null/.test(quiz), 'quiz writes must send the assignment id');
assert(/data-asgn-id/.test(quiz) && /state\.assignmentId = btn\.getAttribute\('data-asgn-id'\)/.test(quiz), 'in-page assignment banner must retain the assignment id');
assert(/state\.assignmentId=null/.test(quiz), 'leaving an assigned session must clear stale assignment attribution');
console.log('  ok   assignment links and quiz writes carry assignment_id');

console.log('\nCode-generation tests passed (2 cases).');
