// Subjects awaiting quality control are locked (data/forge-data.js): visible
// as "Coming soon" in the quiz picker, absent from timed practice and from
// the teacher's create-class list, and unreachable by link or saved session.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('data/forge-catalog.js', 'utf8'), context);
const SUBJECTS = context.window.SUBJECTS;

const expected = ['englit', 'engll', 'pe', 'mand', 'french', 'german', 'span', 'maths', 'gcse-psych', 'psych', 'crim', 'hsc', 'gcse-maths', 'pol', 'rs', 'media'];
const locked = Object.keys(SUBJECTS).filter((k) => SUBJECTS[k].locked);
assert.deepStrictEqual(locked.sort(), expected.slice().sort(), 'the catalog locks exactly the agreed subjects (rebuild with build-question-payloads.js)');

const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert.ok(/function isLockedSubject\(/.test(quiz), 'the quiz page knows which subjects are locked');
assert.ok(/if \(isLockedSubject\(state\.subject\)/.test(quiz), 'the quiz page sends a locked subject back to the picker');
assert.ok(/subject-btn--locked[^\n]*disabled/.test(quiz) && /Coming soon/.test(quiz), 'the picker shows locked subjects as Coming soon');

assert.ok(/subjectKeys = subjectKeys\.filter\(function\(k\) \{ return !isLockedSubject\(k\); \}\)\s*\.concat\(subjectKeys\.filter\(function\(k\) \{ return isLockedSubject\(k\); \}\)\)/.test(quiz), 'the picker lists available subjects before Coming soon ones');

const crucible = fs.readFileSync('pages/app/crucible.html', 'utf8');
assert.ok(/if\(s\.locked\) return;/.test(crucible), 'timed practice leaves locked subjects out');

const teacher = fs.readFileSync('pages/app/teacher.html', 'utf8');
assert.strictEqual((teacher.match(/if \(SUBJECTS\[s\.key\]\.locked\) return;/g) || []).length, 2, 'both create-class lists leave locked subjects out');

console.log('Locked subject tests passed (' + expected.length + ' subjects locked).');
