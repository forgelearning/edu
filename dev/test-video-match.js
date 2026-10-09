const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// The video offered after a wrong answer (scripts/forge-video-match.js),
// against the real bank and library. dev/audit-video-matches.js prints the
// full picture; this pins what must and must not happen.
const win = {};
win.window = win;
vm.createContext(win);
vm.runInContext(fs.readFileSync('data/forge-data.js', 'utf8') + ';window.SUBJECTS=SUBJECTS;window.BANKS=BANKS;', win);
vm.runInContext(fs.readFileSync('data/misconception-labels.js', 'utf8'), win);
vm.runInContext(fs.readFileSync('scripts/forge-video-library.js', 'utf8'), win);
vm.runInContext(fs.readFileSync('scripts/forge-video-match.js', 'utf8'), win);
const M = win.ForgeVideoMatch, L = win.ForgeVideoLibrary;

function question(id) {
  for (const b of Object.keys(win.BANKS)) {
    const q = (win.BANKS[b].questions || []).find((x) => x.id === id);
    if (q) return q;
  }
  throw new Error('no question ' + id);
}
const offered = (subject, id) => {
  // With the misconception label, as the pages pass it.
  const q = question(id);
  const v = M.match(L, q, subject, win.resolveMCLabel ? win.resolveMCLabel(q.tag) : '', M.subjectQuestions(subject), M.topicFor(q));
  return v ? v.title : null;
};

// Every subject has a library.
for (const subject of Object.keys(win.SUBJECTS)) assert(L.subjects[subject] && L.libraries[L.subjects[subject]], subject + ' has a video library');

// Clear matches are offered.
assert.strictEqual(offered('econ', 'TH1-PES-09'), 'Price elasticity of supply');
assert.strictEqual(offered('psych', 'SI-01'), 'Asch and conformity');
assert.strictEqual(offered('gcse-geo', 'GCSE-HAZ-35'), 'The global atmospheric circulation');
assert.strictEqual(offered('gcse-maths', 'MATH-P1-01'), 'Standard form');

// Wrong matches found while tuning, which must not come back: a shared
// common word, a one-word title, an explanation naming a neighbouring idea,
// the opposite case, and the wrong one of two numbered things.
const never = [
  ['econ', 'SD-01', /Oligopoly/], ['econ', 'AS-10', /Long-run costs/], ['econ', 'INF-05', /unemployment/i],
  ['econ', 'TH1-EXT-10', /Negative externalities/], ['gcse-econ', 'GCSE-P2-GLOB-08', /Introduction to supply/],
  ['psych', 'SI-11', /Types of experiment/], ['hist', 'HIST-BRIT2-07', /first Labour government/]
];
for (const [subject, id, bad] of never) {
  const title = offered(subject, id);
  assert(!title || !bad.test(title), `${subject} ${id} must not offer "${title}"`);
}

// Precision over coverage: a share of the bank, not most of it. A jump here
// means the rule has loosened; read dev/audit-video-matches.js before
// accepting it.
let total = 0, hit = 0;
for (const subject of Object.keys(win.SUBJECTS)) {
  const qs = M.subjectQuestions(subject).filter((q) => q.correct);
  total += qs.length;
  hit += qs.filter((q) => M.match(L, q, subject, win.resolveMCLabel ? win.resolveMCLabel(q.tag) : '', qs, M.topicFor(q))).length;
}
const share = hit / total;
assert(share > .08 && share < .3, 'about one question in eight offers a video, got ' + (share * 100).toFixed(1) + '%');

// Wiring: shown after a wrong answer in practice and in Repair mistakes, in
// the shared in-page player, and loaded only when needed.
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(/if\(!isCorrect\)offerVideo\(fb,q\);/.test(quiz) && /if\(!allCorrect\)offerVideo\(fb,q\);/.test(quiz));
assert(!/<script src="scripts\/forge-video-library\.js"/.test(quiz), 'the library is loaded on the first wrong answer, not with the page');
const anvil = fs.readFileSync('pages/app/anvil.html', 'utf8');
assert(anvil.includes('ForgeVideoMatch.appendTo(fb,q,'));
for (const page of ['forge-quiz', 'anvil']) assert(fs.readFileSync('pages/app/' + page + '.html', 'utf8').includes('scripts/forge-video-player.js'), page + ' loads the player');
console.log(`Video match tests passed (${hit} of ${total} questions offer a video).`);
