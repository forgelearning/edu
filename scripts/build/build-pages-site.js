#!/usr/bin/env node
/* Build the public static site from the organized page sources.
 * Source pages live under pages/, while deployment keeps the existing flat
 * URLs such as /a-level-biology.html and /forge-quiz.html. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { repoRoot, listPageFiles } = require('../support/page-files');
const buildQuestionPayloads = require('./build-question-payloads');

const output = path.join(repoRoot, '_site');
const runtimeDirectories = ['assets', 'css', 'data'];
const runtimeFiles = ['.nojekyll'];
const publicFiles = ['forge-auth.js', 'manifest.json', 'og-image.png', 'service-worker.js'];
const sharedUiVersion = '20260823-motion';
// Every data file a page references directly with a <script src>. Versioned by
// content hash (see versionDataAssets) rather than by a literal.
const dataAssets = [
  'data/forge-catalog.js',
  'data/forge-question-index.js',
  'data/misconception-labels.js',
  'data/spec-registry.js',
  'data/starter-activities.js'
];
const sharedUiAssets = [
  'css/tokens.css',
  'css/base.css',
  'css/components.css',
  'css/states.css',
  'css/sidebar.css',
  'scripts/forge-page-actions.js',
  'scripts/forge-state.js'
];

function copyTree(source, target, filter = () => true) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!filter(entry)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to, filter);
    else fs.copyFileSync(from, to);
  }
}

function versionSharedUiAssets(source) {
  return sharedUiAssets.reduce((html, asset) => {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(`${escaped}(?:\\?v=[^"'\\s>]+)?`, 'g'), `${asset}?v=${sharedUiVersion}`);
  }, source);
}

/*
 * The data files carry a `?v=` too, but theirs used to be hand-typed into each
 * page and was never bumped when the data changed — so a content change shipped
 * a new catalogue at an unchanged URL and browsers kept serving the old one
 * until its 10-minute max-age lapsed. That is how a bank split on 2026-09-07
 * appeared in the student picker but not in the teacher assignment form: the
 * two pages happened to pin different literals, so their cache entries expired
 * at different times.
 *
 * Versioning by content hash instead means the URL changes exactly when the
 * file does, and never otherwise. Nothing to remember to bump.
 */
function versionDataAssets(source) {
  return dataAssets.reduce((html, asset) => {
    const file = path.join(repoRoot, asset);
    if (!fs.existsSync(file)) return html;
    const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Anchored to the src attribute: an unanchored match also rewrites the
    // filename where a page merely mentions it in a comment or in body copy.
    return html.replace(
      new RegExp(`src="${escaped}(?:\\?v=[^"]*)?"`, 'g'),
      `src="${asset}?v=${hash}"`
    );
  }, source);
}

function build() {
  buildQuestionPayloads();
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  for (const directory of runtimeDirectories) copyTree(path.join(repoRoot, directory), path.join(output, directory));
  copyTree(path.join(repoRoot, 'scripts'), path.join(output, 'scripts'), entry => entry.isFile() && entry.name.endsWith('.js'));
  for (const file of runtimeFiles) fs.copyFileSync(path.join(repoRoot, file), path.join(output, file));
  for (const file of publicFiles) fs.copyFileSync(path.join(repoRoot, 'public', file), path.join(output, file));

  const destinations = new Set();
  for (const source of listPageFiles()) {
    const destination = path.join(output, path.basename(source));
    if (destinations.has(destination)) throw new Error(`Duplicate public page: ${path.basename(source)}`);
    destinations.add(destination);
    const html = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(destination, versionDataAssets(versionSharedUiAssets(html)));
  }
  if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Build did not produce index.html');
  console.log(`Built ${destinations.size} HTML pages and public assets in ${output}`);
}

if (require.main === module) build();
module.exports = build;
