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

/* These three assertions used to pin a typed school field with a datalist of
   the teacher's existing spellings, normalised client-side.
   20260821200100_bind_teachers_to_invited_school.sql superseded that: a class's
   school is now taken from the teacher's invite via teacher_profiles by a
   before-insert trigger, and the insert is refused when no profile exists. A
   typed value cannot survive that trigger, so offering the field would tell a
   teacher they are choosing something they are not. The fragmentation this
   guarded against is now structurally impossible rather than merely discouraged.
   The alias table and normalise trigger below still apply to the derived value. */
assert(/function schoolIdentityKey/.test(teacher), 'the canonical school key helper is still used for local grouping');
assert(!/list:'c-school-options'/.test(teacher), 'school must not be typed: it comes from the teacher invite');
assert(/c-school-label/.test(teacher), 'the create form should show the invited school read-only');
assert(/MIN_BAND_COHORT = 10/.test(overview), 'small-cohort threshold must remain explicit');
assert(/Individual bands are hidden until at least/.test(overview), 'overview must explain small-cohort suppression');
assert(/create table if not exists public\.school_aliases/.test(migration), 'school aliases need a durable private table');
assert(/create trigger classes_normalise_school_identity/.test(migration), 'school identity must be enforced for direct inserts too');
console.log('  ok   school identity and small-cohort privacy guards are present');

console.log('\nSchool identity tests passed (1 case).');
