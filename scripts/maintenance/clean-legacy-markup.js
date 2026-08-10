#!/usr/bin/env node
// Normalises the maintained template and development harnesses onto the same
// external CSS and event-delegation contracts as production pages.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const template = path.join(root, 'templates/gcse-subject-template.html');
let html = fs.readFileSync(template, 'utf8');
const css = [];
html = html.replace(/<style>([\s\S]*?)<\/style>/i, (_, block) => { css.push(block.trim()); return ''; });
const rules = new Map();
let serial = 0;
html = html.replace(/\sstyle="([^"]*)"/gi, (_, value) => {
  const key = value.trim();
  if (!rules.has(key)) rules.set(key, `template-inline-${++serial}`);
  return ` class="${rules.get(key)}"`;
});
html = html.replace(/class="([^"]*)"\s+class="([^"]*)"/g, (_, first, second) => `class="${first} ${second}"`);
html = html.replace(/href="\.\.\/css\/tokens\.css"/, 'href="../css/tokens.css"');
html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="../css/page-overrides/template-gcse-subject.css">\n</head>');
html = html.replace(/src="scripts\//g, 'src="../scripts/');
html = html.replace(/href="(index|forge-quiz|teacher|school-overview|anvil|crucible|faq|privacy)\.html/g, 'href="../$1.html');
fs.writeFileSync(template, html);
const override = [
  '/* Generated from the maintained GCSE subject template. Keep template markup class-based. */',
  ...css,
  ...Array.from(rules.entries(), ([value, cls]) => `.${cls}{${value}}`)
].join('\n\n') + '\n';
fs.writeFileSync(path.join(root, 'css/page-overrides/template-gcse-subject.css'), override);
console.log(`Cleaned template: ${rules.size} inline declarations moved to an external contract.`);
