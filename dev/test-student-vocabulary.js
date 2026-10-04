#!/usr/bin/env node
/* Students see one vocabulary: Practice, Repair mistakes, Timed practice,
   Revision. The internal names (Anvil, Crucible, Re-forge, Forge mode,
   workbench) used to appear beside the plain ones on the same screen. This
   checks quoted strings and markup text on student pages; identifiers, file
   names and storage keys are lower-case and are not affected. */
const assert = require('assert');
const fs = require('fs');

const files = [
  'pages/app/student-dashboard.html', 'pages/app/forge-quiz.html', 'pages/app/anvil.html',
  'pages/app/crucible.html', 'pages/app/profile.html', 'pages/app/revision.html',
  'pages/app/assignments.html', 'pages/app/student-settings.html',
  'scripts/forge-sidebar.js', 'scripts/forge-revision.js', 'scripts/forge-student-badges.js',
  'scripts/forge-student-delight.js', 'scripts/forge-question.js'
];
// Case-insensitive for re-forge: a lowercase "re-forge" survived the first pass.
// Hyphen-joined CSS names (reforge-box, forge-reforge-result) are not text.
const banned = /\b(Anvil|Crucible|CRUCIBLE|(?<![-\w])[Rr]e-?forge[ds]?(?!-)|[Rr]eforged|Forge mode|(?<![-.\w])[Ss]caffolds?(?![-\w:])|(?<!-)[Ww]orkbench(?!-))\b/;
const found = [];
files.forEach((file) => {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return; // comments
    const pieces = (line.match(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|>[^<>]+</g) || []);
    pieces.forEach((piece) => { if (banned.test(piece)) found.push(file + ':' + (index + 1) + '  ' + piece.slice(0, 90)); });
  });
});
assert.deepStrictEqual(found, [], 'internal names in student-facing text:\n' + found.join('\n'));
console.log('Student vocabulary tests passed (' + files.length + ' files, no internal names in student-facing text).');
