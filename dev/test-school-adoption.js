#!/usr/bin/env node
/* Regression checks for the leadership "is it working" blocks (P3).
 *
 * The overview could already say what is wrong. These four blocks answer the
 * questions a head asks first — is it improving, who has stopped using it, how
 * does it look by year group and teacher, and are pupils with access
 * arrangements keeping up. Each has a failure mode worth pinning. */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const overview = fs.readFileSync(path.join(root, 'pages', 'app', 'school-overview.html'), 'utf8');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260822090000_school_overview_adoption_fields.sql'), 'utf8');

// The payload has to carry the two fields, or grouping and cohort silently
// render as "—" for everyone.
assert(/'teacher_name', teacher_name/.test(migration), 'overview payload must include the class teacher');
assert(/'extra_time', extra_time/.test(migration), 'overview payload must include the access arrangement');
// Pupil names must stay initials-only.
assert(/upper\(string_agg\(left\(w, 1\), '\.'\)\)/.test(migration), 'student names must remain initials in the payload');
console.log('  ok   payload adds teacher and extra time, keeps names as initials');

assert(/id="momentum-title"/.test(overview), 'overview needs a momentum block');
assert(/on the previous ' \+ priorWeeks\.length/.test(overview), 'momentum must compare the latest week with the earlier ones');
console.log('  ok   momentum reports a change, not just a lifetime total');

// A class that stopped has no recent rows at all, so it can only be surfaced by
// iterating classes — deriving the list from responses would hide it.
assert(/id="adoption-title"/.test(overview), 'overview needs an adoption block');
assert(/var adoption = classes\.map/.test(overview),
  'adoption must be built from the class list so never-started classes still appear');
assert(/never: 0, dormant: 1, slowing: 2, active: 3/.test(overview), 'adoption must sort the stalled classes first');
console.log('  ok   adoption lists every class, worst first, including never-started');

assert(/By year group/.test(overview) && /By teacher/.test(overview), 'overview needs year-group and teacher grouping');
assert(/match\(\/\^\\s\*\(\\d\{1,2\}\)\/\)/.test(overview), 'year group must be parsed from the class-name convention');
console.log('  ok   grouping matches how schools are organised');

// Two pupils with extra time in a class of four are identifiable.
assert(/cohorts\.extra\.students < MIN_BAND_COHORT/.test(overview),
  'the cohort split must be withheld below the same minimum the bands use');
assert(/Pupil premium, SEND and EAL are not shown/.test(overview),
  'the overview must say which cohorts it cannot report rather than implying it has them');
console.log('  ok   cohort split is suppressed for small groups and states its limits');

console.log('\nSchool adoption tests passed (5 cases).');
