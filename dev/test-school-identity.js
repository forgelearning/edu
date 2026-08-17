#!/usr/bin/env node
/* Regression checks for school grouping and small-cohort privacy controls. */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const teacher = fs.readFileSync(path.join(root, 'pages', 'app', 'teacher.html'), 'utf8');
const overview = fs.readFileSync(path.join(root, 'pages', 'app', 'school-overview.html'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260817190621_normalize_school_identity.sql'), 'utf8');

assert(/function schoolIdentityKey/.test(teacher), 'teacher class creation needs a canonical school key');
assert(/school_key: schoolIdentityKey\(school\)/.test(teacher), 'new classes must persist school_key');
assert(/list:'c-school-options'/.test(teacher), 'school creation should offer existing canonical spellings');
assert(/MIN_BAND_COHORT = 10/.test(overview), 'small-cohort threshold must remain explicit');
assert(/Individual bands are hidden until at least/.test(overview), 'overview must explain small-cohort suppression');
assert(/create table if not exists public\.school_aliases/.test(migration), 'school aliases need a durable private table');
assert(/create trigger classes_normalise_school_identity/.test(migration), 'school identity must be enforced for direct inserts too');
console.log('  ok   school identity and small-cohort privacy guards are present');

console.log('\nSchool identity tests passed (1 case).');
