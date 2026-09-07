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

/*
 * Cache-bust every local asset a page links, by content hash.
 *
 * There were three schemes here and all three drifted. The CSS and two shared
 * scripts shared one hand-bumped literal; the data files carried a `?v=` typed
 * into each page individually, which is how forge-quiz.html ended up pinning
 * 20260821 while teacher.html pinned 20260823 and the two expired at different
 * times; and the rest -- sidebar.css, tokens.css, generated-utilities.css and a
 * dozen scripts -- carried no version at all, so a change to them was only
 * picked up when the 10-minute max-age lapsed.
 *
 * Hashing the file's contents removes the bookkeeping: the URL changes exactly
 * when the bytes change, and never otherwise. Files that do not exist on disk
 * are left alone, so an external or generated-at-serve-time reference is safe.
 */
const assetHashes = new Map();
function hashFor(asset) {
  if (!assetHashes.has(asset)) {
    const file = path.join(repoRoot, asset);
    assetHashes.set(
      asset,
      fs.existsSync(file) ? crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10) : null
    );
  }
  return assetHashes.get(asset);
}

/*
 * The worker precaches the app shell by path. Once the pages request those same
 * files with a ?v= hash, an unversioned precache entry can never match a page's
 * request, so the shell is cached and then never used -- the offline cold start
 * has nothing to serve. Stamping the same hashes into FORGE_SHELL keeps the two
 * in step.
 *
 * The cache name carries a digest of the resulting list, so a shell asset
 * changing also retires the previous cache instead of leaving dead entries
 * beside the live ones under one fixed name.
 */
/*
 * Assets referenced from inside a script or a stylesheet, which the markup pass
 * cannot see:
 *   - forge-sidebar.js injects pwa.css and forge-pwa.js with a literal ?v=1,
 *     frozen since it was written, so those two never busted at all;
 *   - base.css @imports components.css unversioned, which both risks a stale
 *     copy and makes the browser fetch that file twice per page under two
 *     different URLs. Hashing it makes the import and the link agree.
 */
function listCopiedAssets(output) {
  const found = [];
  for (const directory of ['css', 'scripts']) {
    const base = path.join(output, directory);
    if (!fs.existsSync(base)) continue;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(css|js)$/.test(entry.name)) found.push(full);
      }
    };
    walk(base);
  }
  return found;
}

function versionAssetReferences(source) {
  return source
    .replace(/(['"])\/?((?:css|scripts)\/[^'"?]+\.(?:css|js))(?:\?[^'"]*)?\1/g, (whole, quote, asset) => {
      const hash = hashFor(asset);
      if (!hash) return whole;
      const leadingSlash = whole[1] === '/' ? '/' : '';
      return `${quote}${leadingSlash}${asset}?v=${hash}${quote}`;
    })
    .replace(/@import url\((['"]?)([^'")?]+\.css)(?:\?[^'")]*)?\1\)/g, (whole, quote, name) => {
      const hash = hashFor(`css/${name}`);
      return hash ? `@import url(${quote}${name}?v=${hash}${quote})` : whole;
    });
}

function versionServiceWorkerShell(source) {
  const versioned = source.replace(
    /'\.\/((?:css|scripts)\/[^']+\.(?:css|js))'/g,
    (whole, asset) => {
      const hash = hashFor(asset);
      return hash ? `'./${asset}?v=${hash}'` : whole;
    }
  );
  const shell = (versioned.match(/var FORGE_SHELL = \[[\s\S]*?\];/) || [''])[0];
  const digest = crypto.createHash('sha1').update(shell).digest('hex').slice(0, 8);
  return versioned.replace(/var FORGE_CACHE = '([^']*?)(?:-[0-9a-f]{8})?';/, `var FORGE_CACHE = '$1-${digest}';`);
}

function versionAssets(source) {
  return source.replace(
    /(href|src)="((?:css|scripts|data)\/[^"?]+\.(?:css|js))(?:\?[^"]*)?"/g,
    (whole, attribute, asset) => {
      const hash = hashFor(asset);
      return hash ? `${attribute}="${asset}?v=${hash}"` : whole;
    }
  );
}

function build() {
  buildQuestionPayloads();
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  for (const directory of runtimeDirectories) copyTree(path.join(repoRoot, directory), path.join(output, directory));
  copyTree(path.join(repoRoot, 'scripts'), path.join(output, 'scripts'), entry => entry.isFile() && entry.name.endsWith('.js'));
  // Hashes are always read from the source tree, so rewriting the copies here
  // cannot feed back into the values stamped anywhere else.
  for (const asset of listCopiedAssets(output)) {
    fs.writeFileSync(asset, versionAssetReferences(fs.readFileSync(asset, 'utf8')));
  }
  for (const file of runtimeFiles) fs.copyFileSync(path.join(repoRoot, file), path.join(output, file));
  for (const file of publicFiles) {
    const from = path.join(repoRoot, 'public', file);
    const to = path.join(output, file);
    if (file === 'service-worker.js') fs.writeFileSync(to, versionServiceWorkerShell(fs.readFileSync(from, 'utf8')));
    else fs.copyFileSync(from, to);
  }

  const destinations = new Set();
  for (const source of listPageFiles()) {
    const destination = path.join(output, path.basename(source));
    if (destinations.has(destination)) throw new Error(`Duplicate public page: ${path.basename(source)}`);
    destinations.add(destination);
    const html = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(destination, versionAssets(html));
  }
  if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Build did not produce index.html');
  console.log(`Built ${destinations.size} HTML pages and public assets in ${output}`);
}

if (require.main === module) build();
module.exports = build;
