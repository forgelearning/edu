#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const teacher = fs.readFileSync(path.join(root, 'pages', 'app', 'teacher.html'), 'utf8');

assert(/teacherBankLabel\(ps\.weakBank\)/.test(teacher),
  'the class summary must resolve a weak bank ID to its teacher-facing topic label');
assert(/teacherMisconceptionLabel\(ps\.topMC\)/.test(teacher),
  'the class summary must resolve a misconception tag to its teacher-facing label');
assert(/teacherMisconceptionLabel\(tag\)/.test(teacher),
  'the intervention list must resolve misconception tags to teacher-facing labels');
assert(!/class="mono forge-u-gsw1zp"/.test(teacher),
  'teacher-facing diagnostic prose must not be styled as an internal code');

console.log('Teacher diagnostic label tests passed (4 cases).');
