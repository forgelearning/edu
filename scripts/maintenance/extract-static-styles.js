#!/usr/bin/env node
/* Compile remaining static style attributes into one shared utility sheet.
 * Dynamic values are intentionally retained because they are calculated at
 * render time (progress, subject colour, answer state, and similar data). */
const fs = require('fs');
const path = require('path');
const { listPageFiles } = require('../support/page-files');
const root = path.resolve(__dirname, '..', '..');
const cssFile = path.join(root, 'css/generated-utilities.css');
const pages = listPageFiles();
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

for (const file of pages) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/<[^>]*style="([^"]*)"[^>]*>/g, (tag, style) => {
    if (isDynamic(style)) return tag;
    return addClass(tag.replace(` style="${style}"`, ''), classFor(style));
  });
  let withSheet = after;
  // Only link the sheet where the page actually uses one of its classes. This
  // used to link it unconditionally, which put an extra stylesheet request on
  // redirect stubs and other pages that reference nothing in it.
  const needsSheet = /forge-u-[a-z0-9]+/.test(withSheet);
  if (needsSheet && !withSheet.includes('css/generated-utilities.css')) {
    withSheet = withSheet.replace('</head>', '  <link rel="stylesheet" href="css/generated-utilities.css">\n</head>');
  }
  if (withSheet !== before) fs.writeFileSync(file, withSheet);
}

/* Refuse to shrink the sheet.
 *
 * This script used to overwrite css/generated-utilities.css with whatever it
 * had just extracted. Once the pages had been converted, there were no inline
 * styles left to find, so a later run wrote an empty sheet -- and 210 classes
 * the markup still referenced silently stopped resolving. That shipped and went
 * unnoticed for five weeks.
 *
 * Extraction is now additive: existing rules are kept and newly extracted ones
 * merged in, so a run that finds nothing leaves the sheet intact.
 *
 * The matching guard -- that every forge-u-* class a page references actually
 * resolves -- lives in scripts/checks/check-ui-system.js, so it runs in CI on
 * every change rather than only when someone happens to run this script. */
const existing = new Map();
if (fs.existsSync(cssFile)) {
  const current = fs.readFileSync(cssFile, 'utf8');
  for (const match of current.matchAll(/^\.(forge-u-[a-z0-9]+)\{([^}]*)\}$/gm)) existing.set(match[1], match[2]);
}

const merged = new Map([...existing, ...styles]);

const preserved = fs.existsSync(cssFile)
  ? fs.readFileSync(cssFile, 'utf8').split(/\n(?=\.forge-u-)/)[0].trimEnd()
  : '/* Generated from static style attributes. */';
const output = [preserved];
for (const [className, style] of [...merged].sort((a, b) => a[0].localeCompare(b[0]))) output.push(`.${className}{${style}}`);
fs.writeFileSync(cssFile, `${output.join('\n')}\n`);
console.log(
  `Extracted ${styles.size} static style declaration(s); sheet now holds ${merged.size} rule(s).`
);
