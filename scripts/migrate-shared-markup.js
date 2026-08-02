#!/usr/bin/env node
/* One-time source migration for the shared static page shell.
 * Kept in-repo so future generated pages can be checked against the same
 * canonical markup rules. It only touches explicit root HTML entry points. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const replacements = [
  [/scripts\/forge-sidebar\.js(?!\?v=)/g, 'scripts/forge-sidebar.js?v=20260802'],
  [/class="forge-logo-dark"([\s\S]*?)class="forge-logo-img"/g, 'class="forge-logo-dark forge-logo-img"$1'],
  [/class="forge-logo-light"([\s\S]*?)class="forge-logo-img"/g, 'class="forge-logo-light forge-logo-img"$1'],
  [/ style="max-width:1080px;margin:0 auto"/g, ''],
  [/ style="line-height:1;display:inline-flex;align-items:center;gap:20px;text-decoration:none"/g, ''],
  [/ style="display:inline-flex;align-items:center;flex-shrink:0;transition:transform \.4s ease"/g, ''],
  [/ style="display:inline-flex;align-items:center;overflow:hidden;transition:opacity \.4s ease,width \.4s ease,transform \.4s ease"/g, ''],
  [/class="nav-link" style="font-family:inherit;cursor:pointer;background:transparent;border:none;padding:0"/g, 'class="nav-link forge-nav-menu-button"'],
  [/ style="border-top:1px solid var\(--line\);margin-top:4px;padding-top:10px"/g, ' class="nav-drop-divider"'],
  [/onclick="toggleTheme\(\)"/g, 'data-forge-action="theme"'],
  [/onclick="forgeLogout\(\);return false"/g, 'data-forge-action="logout"'],
  [/onclick="window\.location\.href=\\'forge-quiz\.html\\'"/g, 'data-forge-action="go-quiz"'],
  [/onclick="renderStep1\(\)"/g, 'data-forge-action="signup-step-1"'],
  [/onclick="renderStep2\(\)"/g, 'data-forge-action="signup-step-2"'],
  [/onclick="skipToDashboard\(\)"/g, 'data-forge-action="signup-dashboard"'],
  [/onclick="ForgeAuth\.goToLanding\(\)"/g, 'data-forge-action="go-landing"'],
  [/onclick="ForgeAuth\.signOut\(\);renderStep1\(\);"/g, 'data-forge-action="signup-step-1"'],
  [/onclick="signOut\(\)"/g, 'data-forge-action="logout"'],
  [/onclick="switchLevel\(\\'alevel\\'\)"/g, 'data-forge-action="switch-level" data-level="alevel"'],
  [/onclick="switchLevel\(\\'gcse\\'\)"/g, 'data-forge-action="switch-level" data-level="gcse"'],
  [/onclick="switchTab\(\\'([^']+)\\'\)"/g, 'data-forge-action="switch-tab" data-tab="$1"'],
  [/onclick="exportCSV\(\\'([^']+)\\'\)"/g, 'data-forge-action="export-csv" data-tab="$1"'],
  [/onclick="renderAnvilHome\(\)"/g, 'data-forge-action="anvil-home"'],
  [/onclick="startCrucible\(\)"/g, 'data-forge-action="crucible-start"'],
  [/onclick="buildQuestions\(\);state\.phase=\\'ready\\';render\(\)"/g, 'data-forge-action="crucible-build"'],
  [/onclick="state\.phase=\\'subject\\';render\(\)"/g, 'data-forge-action="crucible-subject"'],
  [/onclick="state\.phase=\\'bank\\';render\(\)"/g, 'data-forge-action="crucible-bank"'],
  [/onclick="state\.phase=state\.classSubject\?\\'bank\\':\\'subject\\';render\(\)"/g, 'data-forge-action="crucible-back"'],
  [/onclick="document\.getElementById\\(\\'class-link-form\\'\\)\.style\.display=document\.getElementById\\(\\'class-link-form\\'\\)\.style\.display===\\'none\\'\?\\'block\\':\\'none\\'"/g, 'data-forge-action="toggle-class-link"'],
];

let changed = 0;
for (const name of pages) {
  const file = path.join(root, name);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [pattern, replacement] of replacements) after = after.replace(pattern, replacement);
  if (after.indexOf('scripts/forge-page-actions.js') < 0 && after.indexOf('</body>') >= 0) {
    after = after.replace('</body>', '  <script src="scripts/forge-page-actions.js"></script>\n</body>');
  }
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}
console.log(`Migrated shared markup in ${changed} HTML pages.`);
