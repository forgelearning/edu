#!/usr/bin/env node
/* Build the public static site from the organized page sources.
 * Source pages live under pages/, while deployment keeps the existing flat
 * URLs such as /a-level-biology.html and /forge-quiz.html. */
const fs = require('fs');
const path = require('path');
const { repoRoot, listPageFiles } = require('../support/page-files');
const buildQuestionPayloads = require('./build-question-payloads');

const output = path.join(repoRoot, '_site');
const runtimeDirectories = ['assets', 'css', 'data'];
const runtimeFiles = ['.nojekyll'];
const publicFiles = ['forge-auth.js', 'manifest.json', 'og-image.png', 'service-worker.js'];

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
    fs.copyFileSync(source, destination);
  }
  if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Build did not produce index.html');
  console.log(`Built ${destinations.size} HTML pages and public assets in ${output}`);
}

if (require.main === module) build();
module.exports = build;
