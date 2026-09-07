#!/usr/bin/env node
/* Lightweight UI-system guardrail. Run with: node scripts/checks/check-ui-system.js */
const fs = require('fs');
const path = require('path');
const { repoRoot, listPageFiles } = require('../support/page-files');

const root = repoRoot;
const htmlFiles = listPageFiles();
const maintainedHtmlFiles = [
  ...htmlFiles,
  ...['dev/sidebar-test.html', 'dev/teacher-dashboard-test.html', 'templates/gcse-subject-template.html'].map(name => path.join(root, name))
];
const failures = [];
const metrics = { pages: htmlFiles.length, dynamicStyleAttributes: 0, staticStyleAttributes: 0, inlineStyleBlocks: 0, inlineEventAttributes: 0, runtimeInlineHandlerSources: 0, undeclaredUtilityClasses: 0, legacyLogoClassAttributes: 0, duplicateClassAttributes: 0, directSupabaseFetches: 0, subjectPagesWithoutSharedCss: 0 };

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

/* Every forge-u-* class a page references must resolve to a rule.
 *
 * This check already forbids inline style attributes, which is what pushed the
 * styling into generated forge-u-* classes in the first place -- but nothing
 * verified the classes existed. css/generated-utilities.css shipped empty on
 * 2026-08-02 and 210 classes across 8 pages silently resolved to nothing for
 * five weeks, costing the school overview its header layout and its tables
 * their column sizing. A missing rule has no console error and no visual cue
 * beyond the layout quietly being wrong, so it needs a check. */
const declaredUtilities = new Set();
for (const dir of ['css', 'css/page-overrides']) {
  const directory = path.join(root, dir);
  if (!fs.existsSync(directory)) continue;
  for (const name of fs.readdirSync(directory)) {
    if (!name.endsWith('.css')) continue;
    const sheet = fs.readFileSync(path.join(directory, name), 'utf8');
    for (const match of sheet.matchAll(/\.(forge-u-[a-z0-9]+)/g)) declaredUtilities.add(match[1]);
  }
}
for (const file of htmlFiles) {
  const name = path.relative(root, file);
  const referenced = new Set();
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/forge-u-[a-z0-9]+/g)) referenced.add(match[0]);
  const undeclared = [...referenced].filter(cls => !declaredUtilities.has(cls)).sort();
  if (undeclared.length) {
    metrics.undeclaredUtilityClasses += undeclared.length;
    failures.push(`${name}: ${undeclared.length} forge-u class(es) with no CSS rule (${undeclared.slice(0, 5).join(', ')}${undeclared.length > 5 ? ', …' : ''})`);
  }
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
