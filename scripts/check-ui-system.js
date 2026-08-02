#!/usr/bin/env node
/* Lightweight UI-system guardrail. Run with: node scripts/check-ui-system.js */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const failures = [];
const metrics = { pages: htmlFiles.length, legacyLogoClassAttributes: 0, duplicateClassAttributes: 0, directSupabaseFetches: 0, subjectPagesWithoutSharedCss: 0 };

for (const name of htmlFiles) {
  const file = path.join(root, name);
  const source = fs.readFileSync(file, 'utf8');
  const markupSource = source.replace(/<!--[\s\S]*?-->/g, '');
  const duplicateClass = /<[^>]+\bclass="[^"]+"[^>]+\bclass="/g;
  const duplicateMatches = markupSource.match(duplicateClass) || [];
  const legacyLogoMatches = duplicateMatches.filter(match => /forge-logo-(?:dark|light)/.test(match));
  metrics.legacyLogoClassAttributes += legacyLogoMatches.length;
  const realDuplicateMatches = duplicateMatches.filter(match => !/forge-logo-(?:dark|light)/.test(match));
  if (realDuplicateMatches.length) {
    metrics.duplicateClassAttributes += realDuplicateMatches.length;
    failures.push(`${name}: duplicate class attributes (${realDuplicateMatches.length})`);
  }
  const directSupabase = source.match(/fetch\s*\([^)]*supabase|supabase\.co\/rest|from\(['"]@supabase/gim) || [];
  if (directSupabase.length) {
    metrics.directSupabaseFetches += directSupabase.length;
    failures.push(`${name}: direct Supabase transport (${directSupabase.length})`);
  }
  if (/^(a-level|gcse)-/.test(name)) {
    const required = ['css/tokens.css', 'css/base.css', 'css/components.css', 'css/subject-pages.css', 'css/discovery.css'];
    const missing = required.filter(asset => !source.includes(asset));
    if (missing.length) {
      metrics.subjectPagesWithoutSharedCss += 1;
      failures.push(`${name}: missing shared CSS ${missing.join(', ')}`);
    }
  }
}

console.log(JSON.stringify(metrics, null, 2));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('UI system checks passed.');
