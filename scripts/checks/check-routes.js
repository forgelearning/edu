#!/usr/bin/env node
/* HTTP smoke test for every root HTML entry point and every local HTML asset/link. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const base = process.env.FORGE_BASE_URL || 'http://127.0.0.1:4173';
const root = path.resolve(__dirname, '..', '..');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const localRefs = new Set();

function collectLocalRefs(page) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const cssRefs = [];
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (!value || /^(?:https?:|mailto:|javascript:|data:|#|\/\/)/i.test(value)) continue;
    const clean = value.split('#')[0];
    if (!clean) continue;
    localRefs.add(new URL(clean, `${base}/${page}`).href);
    if (/\.css(?:$|\?)/i.test(clean)) cssRefs.push(clean.split('?')[0]);
  }
  for (const cssRef of cssRefs) {
    const cssPath = path.resolve(root, cssRef);
    if (!fs.existsSync(cssPath)) continue;
    const css = fs.readFileSync(cssPath, 'utf8');
    for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/gi)) {
      const value = match[1].trim();
      if (!value || /^(?:https?:|data:|#|\/\/)/i.test(value)) continue;
      localRefs.add(new URL(value, new URL(cssRef, `${base}/${page}`).href).href);
    }
  }
}

async function check(url) {
  await new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, response => {
      response.resume();
      response.on('end', () => response.statusCode >= 200 && response.statusCode < 400 ? resolve() : reject(new Error(`${response.statusCode} ${url}`)));
    });
    request.setTimeout(5000, () => request.destroy(new Error(`Timeout ${url}`)));
    request.on('error', reject);
  });
}

(async function () {
  const failures = [];
  for (const page of pages) {
    collectLocalRefs(page);
    try { await check(`${base}/${page}`); } catch (error) { failures.push(error.message); }
  }
  for (const url of localRefs) {
    try { await check(url); } catch (error) { failures.push(error.message); }
  }
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`Route smoke passed for ${pages.length} HTML pages and ${localRefs.size} referenced local assets/links.`);
}());
