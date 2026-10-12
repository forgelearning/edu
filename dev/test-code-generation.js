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

const resetSql = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20261012183559_reset_student_access_code.sql'), 'utf8');
assert(/id="reset-code-select"/.test(teacher) && /id="reset-code-btn"/.test(teacher), 'class tools need a per-student code reset');
assert(/ForgeAPI\.rpc\('reset_student_access_code', \{ p_student_id: sid \}/.test(teacher), 'reset must go through the owner-scoped RPC');
assert(/aria-labelledby="reset-code-title"/.test(teacher), 'reset confirmation needs dialog semantics');
assert(/renderGeneratedCodes\(\[row\], true\)/.test(teacher), 'a reset code must be shown once on screen');
assert(/teacher_user_id = auth\.uid\(\)/.test(resetSql), 'reset must be scoped to the class owner');
assert(/update public\.student_access_codes ac\s+set code_hash = v_hash/.test(resetSql), 'reset must replace the hash in place so the student keeps their record');
assert(!/insert into public\.student_access_codes/.test(resetSql), 'reset must not create a first code for a name-only class');
assert(/revoke all on function public\.reset_student_access_code\(uuid\) from public, anon/.test(resetSql), 'reset must not be callable anonymously');
console.log('  ok   a lost student code can be reset by the class owner');

assert(/id="print-generated-codes"/.test(teacher) && /printCodeSlips\(rows, withNames\)/.test(teacher), 'generated codes can be printed as slips');
assert(/assets\/brand\/forge-crest\.png/.test(teacher) && fs.existsSync(path.join(root, 'assets', 'brand', 'forge-crest.png')), 'code slips carry the Forge crest');
assert(!/window\.open\(/.test(teacher.slice(teacher.indexOf('function printCodeSlips'), teacher.indexOf('function renderGeneratedCodes'))), 'code slips print from a frame, not a popup');
console.log('  ok   generated codes print as branded slips');

assert(/assignment_id=/.test(assignments), 'assignment links must carry their assignment id');
assert(/requestedAssignmentId/.test(quiz) && /state\.assignmentId/.test(quiz), 'quiz route must retain the assignment id');
assert(/p_assignment_id: row\.assignment_id \|\| null/.test(quiz), 'quiz writes must send the assignment id');
assert(/data-asgn-id/.test(quiz) && /state\.assignmentId = btn\.getAttribute\('data-asgn-id'\)/.test(quiz), 'in-page assignment banner must retain the assignment id');
assert(/state\.assignmentId=null/.test(quiz), 'leaving an assigned session must clear stale assignment attribution');
console.log('  ok   assignment links and quiz writes carry assignment_id');

console.log('\nCode-generation tests passed (4 cases).');
