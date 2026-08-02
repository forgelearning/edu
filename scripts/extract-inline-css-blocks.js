#!/usr/bin/env node
/* Keep page-specific exceptions explicit and external. Shared patterns belong
 * in css/components.css; this file only moves legacy route-local CSS out of
 * HTML so it is reviewable, cacheable, and never mixed into document markup. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'css/page-overrides');
fs.mkdirSync(outDir, { recursive: true });
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
let changed = 0;
for (const name of pages) {
  const file = path.join(root, name);
  const before = fs.readFileSync(file, 'utf8');
  const blocks = [...before.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)];
  if (!blocks.length) continue;
  const css = blocks.map(match => match[1].trim()).filter(Boolean).join('\n\n');
  const outFile = path.join(outDir, name.replace(/\.html$/, '.css'));
  fs.writeFileSync(outFile, `/* Route-specific overrides for ${name}. Shared rules belong in components.css. */\n${css}\n`);
  let after = before.replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '');
  after = after.replace('</head>', `  <link rel="stylesheet" href="css/page-overrides/${name.replace(/\.html$/, '.css')}">\n</head>`);
  fs.writeFileSync(file, after);
  changed += 1;
}
console.log(`Extracted page CSS blocks from ${changed} HTML pages.`);
