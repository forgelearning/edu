const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const pagesRoot = path.join(repoRoot, 'pages');

function listPageFiles(directory = pagesRoot) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listPageFiles(file));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file);
  }
  return files.sort();
}

function pageFile(name) {
  const matches = listPageFiles().filter(file => path.basename(file) === name);
  if (matches.length !== 1) throw new Error(`Expected one page named ${name}, found ${matches.length}`);
  return matches[0];
}

module.exports = { repoRoot, pagesRoot, listPageFiles, pageFile };
