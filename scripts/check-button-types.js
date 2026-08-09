#!/usr/bin/env node
// Fail when an HTML button omits its explicit type. UI actions should never
// acquire accidental form-submit behavior when markup is moved or reused.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  ...fs.readdirSync(root).filter(name => name.endsWith('.html')).map(name => path.join(root, name)),
  path.join(root, 'dev/sidebar-test.html'),
  path.join(root, 'dev/teacher-dashboard-test.html'),
  path.join(root, 'templates/gcse-subject-template.html')
];
const failures = [];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const match of source.matchAll(/<button\b[^>]*>/gi)) {
    if (!/\btype\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i.test(match[0])) {
      const before = source.slice(0, match.index);
      const line = before.split('\n').length;
      failures.push(`${path.relative(root, file)}:${line}: button is missing an explicit type`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Button type check passed (${files.length} HTML sources checked).`);
