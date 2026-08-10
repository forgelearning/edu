#!/usr/bin/env node
/* Compile remaining static style attributes into one shared utility sheet.
 * Dynamic values are intentionally retained because they are calculated at
 * render time (progress, subject colour, answer state, and similar data). */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const cssFile = path.join(root, 'css/generated-utilities.css');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const styles = new Map();

function isDynamic(style) {
  return /\+|state\.|q\.|bk\.|subj\.|row\.|\bsid\b|\btag\b|\bcol\b|\bpct\b|accCol|gr\.color/.test(style);
}
function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
function classFor(style) {
  const className = `forge-u-${hash(style)}`;
  styles.set(className, style);
  return className;
}
function addClass(tag, className) {
  if (/\bclass="[^"]*"/.test(tag)) return tag.replace(/\bclass="([^"]*)"/, (_, classes) => `class="${classes} ${className}"`);
  return tag.replace(/<([a-z0-9-]+)/i, `<$1 class="${className}"`);
}

for (const name of pages) {
  const file = path.join(root, name);
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/<[^>]*style="([^"]*)"[^>]*>/g, (tag, style) => {
    if (isDynamic(style)) return tag;
    return addClass(tag.replace(` style="${style}"`, ''), classFor(style));
  });
  let withSheet = after;
  if (!withSheet.includes('css/generated-utilities.css')) {
    withSheet = withSheet.replace('</head>', '  <link rel="stylesheet" href="css/generated-utilities.css">\n</head>');
  }
  if (withSheet !== before) fs.writeFileSync(file, withSheet);
}

const output = ['/* Generated from static style attributes. Run scripts/maintenance/extract-static-styles.js after template changes. */'];
for (const [className, style] of styles) output.push(`.${className}{${style}}`);
fs.writeFileSync(cssFile, `${output.join('\n')}\n`);
console.log(`Extracted ${styles.size} static style declarations into css/generated-utilities.css.`);
