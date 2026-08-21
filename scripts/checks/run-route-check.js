#!/usr/bin/env node
/*
 * F7 — `npm run check` used to stop here on a developer's machine.
 *
 * check-routes.js is an HTTP smoke test, not a static one: it needs the built
 * site actually being served. The Pages workflow starts a static server on
 * 127.0.0.1:4173 around it, but the npm script did not, so the documented
 * local gate always exited 1 at that step — the one thing CONTRIBUTING-style
 * notes tell you to run before committing.
 *
 * This wrapper does what the workflow does: serve _site on a free port, wait
 * for it to answer, run the check against it, and shut the server down again
 * whatever the outcome. If something is already serving on the port (a staging
 * session, say) it is left alone and reused.
 */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

const PORT = Number(process.env.FORGE_ROUTE_CHECK_PORT || 4173);
const HOST = '127.0.0.1';
const BASE = `http://${HOST}:${PORT}`;
const repoRoot = path.resolve(__dirname, '..', '..');
const siteRoot = path.join(repoRoot, '_site');

if (!fs.existsSync(siteRoot)) {
  console.error('_site is missing — run node scripts/build/build-pages-site.js first.');
  process.exit(2);
}

function ping() {
  return new Promise((resolve) => {
    const request = http.get(`${BASE}/index.html`, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(1000, () => { request.destroy(); resolve(false); });
  });
}

async function waitForServer(attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    if (await ping()) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

function runCheck() {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'check-routes.js')], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { FORGE_BASE_URL: BASE })
  });
  return result.status === null ? 1 : result.status;
}

(async () => {
  if (await ping()) {
    // Something is already serving the site here. Use it and leave it running.
    process.exit(runCheck());
  }

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', HOST, '--directory', siteRoot], {
    stdio: 'ignore',
    detached: false
  });

  let exitCode = 1;
  const stop = () => { if (!server.killed) { try { server.kill(); } catch (e) {} } };
  process.on('exit', stop);
  process.on('SIGINT', () => { stop(); process.exit(130); });

  server.on('error', (error) => {
    console.error('Could not start a static server for the route check:', error.message);
    console.error('Serve _site yourself and re-run, or set FORGE_BASE_URL.');
    process.exit(2);
  });

  if (!(await waitForServer())) {
    stop();
    console.error(`Static server did not come up on ${BASE}`);
    process.exit(2);
  }

  exitCode = runCheck();
  stop();
  process.exit(exitCode);
})();
