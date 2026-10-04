#!/usr/bin/env node
/* Archiving assignments: the column exists, archived work is hidden from
   students on every route, and the teacher only sees "archived" when a row
   really changed. Archiving used to be rejected outright (no column) with a
   misleading "check your connection" message. */
const assert = require('assert');
const fs = require('fs');
const read = (p) => fs.readFileSync(p, 'utf8');

const sql = read('supabase/migrations/20261004170000_assignments_archived.sql');
assert(/add column if not exists archived boolean not null default false/.test(sql), 'the column exists, false for every existing assignment');
assert(/where a\.class_id=v_class_id and not a\.archived order by/.test(sql), 'class-code students do not receive archived assignments');

const filter = /\.filter\(function ?\(a\) ?\{ ?return !\(a ?&& ?a\.archived\); ?\}\)/;
['pages/app/assignments.html', 'scripts/forge-revision.js', 'scripts/forge-student-badges.js'].forEach((file) => {
  assert(filter.test(read(file)), file + ' hides archived assignments from signed-in students');
});

const teacher = read('pages/app/teacher.html');
const archive = teacher.slice(teacher.indexOf("} else if (action === 'archive') {"), teacher.indexOf('// Create assignment handler'));
assert.strictEqual((archive.match(/if \(!Array\.isArray\(rows\) \|\| !rows\.length\) throw new Error\('not updated'\);/g) || []).length, 2, 'archive and restore fail visibly when no row changed');
assert(!/Check your connection/.test(archive), 'the error no longer blames the connection');
assert(!teacher.includes("closest('.asgn-card')"), 'errors land on the card (assign-card), not the button row');
console.log('Assignment archive tests passed (column, student routes, teacher feedback).');
