#!/usr/bin/env node
/* Public pages (homepage, guides, FAQ, pricing, privacy, roadmap, sign-up and
   subject pages) use the same plain names as the app, and the homepage only
   features subjects that are complete. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []);
}
const publicPages = ['pages/marketing', 'pages/guides', 'pages/auth', 'pages/subjects'].flatMap(files);
const banned = /\b(Anvil|Crucible|CRUCIBLE|(?<![-\w])[Rr]e-?forge[ds]?(?!-)|[Rr]eforged|Forge mode|[Ss]caffolds?)\b/;
const found = [];
publicPages.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const m of html.matchAll(/>([^<>]+)</g)) if (banned.test(m[1])) found.push(file + ': ' + m[1].trim().slice(0, 80));
  for (const m of html.matchAll(/\b(?:title|content|aria-label|placeholder|alt)="([^"]*)"/g)) if (banned.test(m[1])) found.push(file + ' (attr): ' + m[1].slice(0, 80));
});
assert.deepStrictEqual(found, [], 'internal names in public page text:\n' + found.join('\n'));

// Text written by scripts on public pages.
const scripted = [['scripts/landing-redesign.js', /The full app would add this idea to Repair mistakes/], ['pages/auth/forge-signup.html', /Practice · Repair mistakes · Timed practice/]];
scripted.forEach(([file, re]) => assert(re.test(fs.readFileSync(file, 'utf8')), file + ' uses the plain names'));

// Featured subjects are complete and have a page.
const index = fs.readFileSync('pages/marketing/index.html', 'utf8');
const status = JSON.parse(fs.readFileSync('data/content-status.json', 'utf8')).subjects;
const featured = [...index.matchAll(/<a href="([^"]+)" data-subject="([^"]+)">/g)];
assert(featured.length >= 3, 'the homepage features subjects');
assert(featured.some((m) => m[2] === 'gcse-geo'), 'GCSE Geography (a pilot subject) is featured');
featured.forEach(([, href, key]) => {
  assert(status[key] && status[key].tier === 'full', key + ' is featured but is not marked full in content-status.json');
  assert(publicPages.some((f) => path.basename(f) === href), href + ' exists');
});

// Sign-in: the free-versus-Pro list is folded away, not the first thing read.
const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
assert(/<details class="forge-whats-free"><summary>What’s free\?<\/summary>/.test(quiz), 'the price list sits behind "What’s free?"');
assert(!/foot: 'Want unlimited\?/.test(quiz), 'the subscribe line is no longer pinned under the sign-in card');
assert(/body\.has-forge-sidebar:has\(#app \.auth-card\)/.test(fs.readFileSync('css/student-motion.css', 'utf8')), 'the app menu is hidden while a student sign-in card shows');
assert(/landing-redesign/.test(fs.readFileSync('scripts/nav.js', 'utf8')), 'the homepage keeps its full header on desktop');
console.log('Public page tests passed (' + publicPages.length + ' pages, plain names, featured subjects complete, sign-in tidy).');
