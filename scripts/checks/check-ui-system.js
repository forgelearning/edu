#!/usr/bin/env node
/* Lightweight UI-system guardrail. Run with: node scripts/checks/check-ui-system.js */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const maintainedHtmlFiles = [
  ...htmlFiles.map(name => path.join(root, name)),
  ...['dev/sidebar-test.html', 'dev/teacher-dashboard-test.html', 'templates/gcse-subject-template.html'].map(name => path.join(root, name))
];
const failures = [];
const metrics = { pages: htmlFiles.length, dynamicStyleAttributes: 0, staticStyleAttributes: 0, inlineStyleBlocks: 0, inlineEventAttributes: 0, runtimeInlineHandlerSources: 0, legacyLogoClassAttributes: 0, duplicateClassAttributes: 0, directSupabaseFetches: 0, subjectPagesWithoutSharedCss: 0 };

for (const file of maintainedHtmlFiles) {
  const name = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  const markupSource = source.replace(/<!--[\s\S]*?-->/g, '');
  const styleBlocks = markupSource.match(/<style\b/gi) || [];
  if (styleBlocks.length) { metrics.inlineStyleBlocks += styleBlocks.length; failures.push(`${name}: inline style block`); }
  const inlineEvents = markupSource.match(/\bon(?:click|input|change|submit)\s*=\s*['"]/gi) || [];
  if (inlineEvents.length) {
    metrics.inlineEventAttributes += inlineEvents.length;
    failures.push(`${name}: inline event attributes (${inlineEvents.length})`);
  }
  const inlineStyles = [...markupSource.matchAll(/\bstyle\s*=\s*"([^"]*)"/g)];
  inlineStyles.forEach(match => {
    if (/\+|state\.|q\.|bk\.|subj\.|row\.|\bsid\b|\btag\b|\bcol\b|\bpct\b|accCol|gr\.color/.test(match[1])) metrics.dynamicStyleAttributes += 1;
    else { metrics.staticStyleAttributes += 1; failures.push(`${name}: static inline style`); }
  });
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
  if (/^(a-level|gcse)-/.test(path.basename(name))) {
    const required = ['css/tokens.css', 'css/base.css', 'css/components.css', 'css/subject-pages.css', 'css/discovery.css', 'css/generated-utilities.css'];
    const missing = required.filter(asset => !source.includes(asset));
    if (missing.length) {
      metrics.subjectPagesWithoutSharedCss += 1;
      failures.push(`${name}: missing shared CSS ${missing.join(', ')}`);
    }
  }
  if (!source.includes('scripts/forge-page-actions.js')) failures.push(`${name}: missing shared action delegate`);
}

const scriptFiles = fs.readdirSync(path.join(root, 'scripts')).filter(name => name.endsWith('.js') && !/^(migrate|extract)-/.test(name));
for (const name of scriptFiles) {
  const source = fs.readFileSync(path.join(root, 'scripts', name), 'utf8');
  const handlers = source.match(/\bon(?:click|input|change|submit)\s*=\s*['"]|\.on(?:click|input|change|submit)\s*=/gi) || [];
  if (handlers.length) {
    metrics.runtimeInlineHandlerSources += handlers.length;
    failures.push(`scripts/${name}: runtime inline handler source (${handlers.length})`);
  }
}

console.log(JSON.stringify(metrics, null, 2));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('UI system checks passed.');
