#!/usr/bin/env node
/* Move repeated static presentation rules into the shared component layer.
 * Dynamic styles (progress widths, subject colours, answer states) remain
 * intentionally data-driven and are excluded from this migration. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const { listPageFiles } = require('../support/page-files');
const files = listPageFiles();
const styles = new Map([
  ['background:rgba(127,217,138,.15);color:var(--good)', 'ui-badge-good'],
  ['background:rgba(127,217,138,.12);color:var(--good)', 'ui-badge-good-soft'],
  ['margin-top:18px;text-align:left', 'ui-margin-top-18-left'],
  ['text-decoration:none', 'ui-link-reset'],
  ['color:var(--slate);text-decoration:none', 'ui-link-reset'],
  ['color:var(--slate);text-decoration:none;font-weight:600', 'ui-link-muted'],
  ['font-size:13px;color:var(--slate)', 'ui-meta-muted'],
  ['font-size:11px;color:var(--slate)', 'ui-meta-dim'],
  ['font-size:26px', 'ui-stat-large'],
  ['margin-left:10px', 'ui-margin-left-3'],
  ['margin:0 auto', 'ui-centered'],
  ['text-align:center', 'ui-center'],
  ['padding-top:52px;padding-bottom:64px', 'ui-section-bottom'],
  ['display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:28px', 'ui-row-between'],
  ['display:flex;gap:8px;flex-wrap:wrap', 'ui-row-wrap'],
  ['display:flex;gap:16px;flex-wrap:wrap', 'ui-row-gap'],
  ['display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px', 'ui-row-actions'],
  ['border-top:1px solid var(--line);padding-top:16px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px', 'ui-footer-row'],
  ['padding:8px 16px;border-radius:var(--radius-sm);background:var(--panel);border:1px solid var(--line);color:var(--white);font-family:\'IBM Plex Sans\',sans-serif;font-weight:600;font-size:13px;text-decoration:none;white-space:nowrap', 'ui-button-secondary-sm'],
  ['padding:8px 16px;border-radius:var(--radius-sm);background:var(--ember);color:var(--coal);font-family:\'IBM Plex Sans\',sans-serif;font-weight:700;font-size:13px;text-decoration:none;white-space:nowrap', 'ui-button-primary-sm'],
  ['text-decoration:none;display:inline-flex;align-items:center;padding:0 18px;height:44px;border-radius:var(--radius-md);border:1px solid var(--line)', 'ui-button-outline-lg'],
]);

function addClass(tag, className) {
  if (/\bclass="[^"]*"/.test(tag)) return tag.replace(/\bclass="([^"]*)"/, (_, classes) => `class="${classes} ${className}"`);
  return tag.replace(/<([a-z0-9-]+)/i, `<$1 class="${className}"`);
}

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [style, className] of styles) {
    const escapedStyle = style.replace(/[.*+?^${}()|[\[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<[^>]*style="${escapedStyle}"[^>]*>`, 'g');
    after = after.replace(pattern, tag => addClass(tag.replace(` style="${style}"`, ''), className));
    const classAndStyle = new RegExp(`(class="[^"]*) style="${escapedStyle}"`, 'g');
    after = after.replace(classAndStyle, `$1 ${className}`);
  }
  if (after !== before) { fs.writeFileSync(file, after); changed += 1; }
}
console.log(`Migrated repeated inline styles in ${changed} HTML pages.`);
