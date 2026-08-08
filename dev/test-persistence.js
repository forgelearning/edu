const fs = require('fs');
const assert = require('assert');

const quiz = fs.readFileSync('forge-quiz.html', 'utf8');

function count(pattern) {
  return (quiz.match(pattern) || []).length;
}

assert(quiz.includes('function showPersistenceStatus(detail)'), 'quiz should expose a visible persistence status helper');
assert(quiz.includes('className = \'forge-status forge-status--error forge-save-status\''), 'persistence failures should use the shared error status styling');
assert(quiz.includes("status.setAttribute('role', 'status')"), 'persistence status should be announced accessibly');
assert(quiz.includes('showPersistenceStatus(detail);'), 'persistence errors should reach the visible status helper');
assert.strictEqual(count(/var responseSaved = logResponse\(/g), 2, 'MCQ and fill-in answers should retain their save promises');
assert.strictEqual(count(/textContent = 'Continue anyway'/g), 4, 'MCQ and fill-in flows should offer explicit recovery for false and rejected saves');
assert.strictEqual(count(/\.catch\(function\(\)\{\s*showPersistenceStatus/g), 2, 'MCQ and fill-in flows should handle rejected saves');
assert(quiz.includes('if (result && result.allowed === false) { renderLimitWall(); return; }'), 'server quota rejection must remain authoritative');
assert(quiz.includes('forge-quiz.css?v=20260808-save-status1'), 'quiz stylesheet cache key should match the recovery UI');

console.log('Forge persistence recovery tests passed (visible failure state, both quiz modes, and quota guard checked).');
