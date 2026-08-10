#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'templates/gcse-subject-template.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<([a-z][^>]*?)>/gi, (whole, inside) => {
  let changed = inside;
  changed = changed.replace(/class="([^"]*)"([^>]*?)class="([^"]*)"/i, (_, first, middle, second) => `class="${first} ${second}"${middle}`);
  return changed === inside ? whole : `<${changed}>`;
});
fs.writeFileSync(file, html);
console.log('Merged duplicate class attributes in the maintained template.');
