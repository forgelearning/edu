#!/usr/bin/env node
/* Compile remaining static style attributes into one shared utility sheet.
 * Dynamic values are intentionally retained because they are calculated at
 * render time (progress, subject colour, answer state, and similar data). */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
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

/* Guard against the destructive second run.
 *
 * This script is not idempotent in the way it looks. The first run moves every
 * static style attribute out of the HTML and into the sheet. A second run finds
 * no style attributes left, so `styles` is empty — and writing that out replaces
 * the whole sheet with just the header comment while the class references stay
 * in the HTML. That silently deletes the styling for every affected element and
 * no structural check can detect it afterwards, because the original
 * declarations only ever existed in the HTML that was just rewritten.
 *
 * So: only ever write a sheet that still defines everything the HTML asks for. */
const referenced = new Set();
for (const name of pages) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  for (const match of source.matchAll(/\b(forge-u-[a-z0-9]+)/g)) referenced.add(match[1]);
}
const missing = [...referenced].filter(className => !styles.has(className));
if (missing.length) {
  console.error(`Refusing to write css/generated-utilities.css.\n`);
  console.error(`${missing.length} utility class(es) are referenced by the HTML but were not`);
  console.error(`produced by this run, so writing now would drop their styling:\n`);
  console.error(`  ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? `, +${missing.length - 8} more` : ''}\n`);
  console.error(`This is what a second run looks like. The extraction has already happened;`);
  console.error(`re-run it only against HTML that still carries static style attributes.`);
  process.exit(1);
}

const output = ['/* Generated from static style attributes. Run scripts/extract-static-styles.js after template changes. */'];
for (const [className, style] of styles) output.push(`.${className}{${style}}`);
fs.writeFileSync(cssFile, `${output.join('\n')}\n`);
console.log(`Extracted ${styles.size} static style declarations into css/generated-utilities.css.`);
