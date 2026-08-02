#!/usr/bin/env node
/* HTTP smoke test for every root HTML entry point and referenced local asset. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const base = process.env.FORGE_BASE_URL || 'http://127.0.0.1:4173';
const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));

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
    try { await check(`${base}/${page}`); } catch (error) { failures.push(error.message); }
  }
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`Route smoke passed for ${pages.length} HTML pages.`);
}());
