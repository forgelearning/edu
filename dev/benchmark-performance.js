#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, '_site');
const CHROME = process.env.FORGE_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RUNS = Math.max(1, Number(process.env.FORGE_PERF_RUNS || 5));
const PORT = Number(process.env.FORGE_PERF_PORT || 4186);
const ROUTES = (process.env.FORGE_PERF_ROUTES || 'student-dashboard.html,assignments.html,anvil.html,crucible.html,forge-quiz.html,profile.html,teacher.html,school-overview.html,index.html')
  .split(',').map(value => value.trim()).filter(Boolean);

function percentile(values, fraction) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function summarize(samples) {
  const keys = ['transferKiB', 'fcpMs', 'domContentLoadedMs', 'loadMs', 'scriptMs', 'taskMs', 'tbtMs', 'heapMiB', 'requests'];
  return Object.fromEntries(keys.map(key => [key, round(percentile(samples.map(sample => sample[key]), 0.5))]));
}

function contentType(file) {
  return ({
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  })[path.extname(file)] || 'application/octet-stream';
}

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const file = path.resolve(SITE, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${SITE}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {'Content-Type': contentType(file), 'Cache-Control': 'no-store'});
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-perf-'));
  const child = spawn(CHROME, [
    '--headless=new',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate,MediaRouter',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank'
  ], {stdio: ['ignore', 'ignore', 'pipe']});

  return new Promise((resolve, reject) => {
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Chrome did not start. ${stderr}`)), 15000);
    child.stderr.on('data', chunk => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolve({child, profile, webSocketUrl: match[1]});
    });
    child.once('error', reject);
  });
}

function connect(url) {
  const socket = new WebSocket(url);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const {resolve, reject} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    const key = `${message.sessionId || ''}:${message.method}`;
    for (const listener of listeners.get(key) || []) listener(message.params || {});
  };
  const ready = new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = () => reject(new Error('Could not connect to Chrome DevTools.'));
  });
  return {
    ready,
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      socket.send(JSON.stringify({id, method, params, ...(sessionId ? {sessionId} : {})}));
      return new Promise((resolve, reject) => pending.set(id, {resolve, reject}));
    },
    once(method, sessionId) {
      const key = `${sessionId || ''}:${method}`;
      return new Promise(resolve => {
        const listener = params => {
          listeners.set(key, (listeners.get(key) || []).filter(item => item !== listener));
          resolve(params);
        };
        listeners.set(key, [...(listeners.get(key) || []), listener]);
      });
    },
    on(method, sessionId, listener) {
      const key = `${sessionId || ''}:${method}`;
      listeners.set(key, [...(listeners.get(key) || []), listener]);
    },
    close() { socket.close(); }
  };
}

async function benchmarkRoute(cdp, route) {
  const {targetId} = await cdp.send('Target.createTarget', {url: 'about:blank'});
  const {sessionId} = await cdp.send('Target.attachToTarget', {targetId, flatten: true});
  const finished = new Map();
  const responses = new Map();
  const exceptions = [];
  cdp.on('Network.responseReceived', sessionId, params => responses.set(params.requestId, params.response));
  cdp.on('Network.loadingFinished', sessionId, params => finished.set(params.requestId, params.encodedDataLength || 0));
  cdp.on('Runtime.exceptionThrown', sessionId, params => exceptions.push(params.exceptionDetails && params.exceptionDetails.text || 'Uncaught exception'));
  await Promise.all([
    cdp.send('Page.enable', {}, sessionId),
    cdp.send('Network.enable', {}, sessionId),
    cdp.send('Runtime.enable', {}, sessionId),
    cdp.send('Performance.enable', {}, sessionId),
    cdp.send('Network.clearBrowserCache', {}, sessionId),
    cdp.send('Network.setCacheDisabled', {cacheDisabled: true}, sessionId),
    cdp.send('Network.setBypassServiceWorker', {bypass: true}, sessionId),
    cdp.send('Network.setBlockedURLs', {urls: ['*google-analytics.com*', '*googletagmanager.com*', '*fonts.googleapis.com*', '*fonts.gstatic.com*']}, sessionId),
    cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 80,
      downloadThroughput: 10_000_000 / 8,
      uploadThroughput: 2_000_000 / 8,
      connectionType: 'cellular4g'
    }, sessionId),
    cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}, sessionId),
    cdp.send('Page.addScriptToEvaluateOnNewDocument', {source: `
      window.__forgeLongTasks = [];
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(entry) { window.__forgeLongTasks.push(entry.duration); });
      }).observe({type: 'longtask', buffered: true});
    `}, sessionId)
  ]);
  const loaded = cdp.once('Page.loadEventFired', sessionId);
  await cdp.send('Page.navigate', {url: `http://127.0.0.1:${PORT}/${route}`}, sessionId);
  await Promise.race([loaded, new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out loading ${route}`)), 60000))]);
  await new Promise(resolve => setTimeout(resolve, 750));

  const [{metrics}, runtime] = await Promise.all([
    cdp.send('Performance.getMetrics', {}, sessionId),
    cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify({
        navigation: performance.getEntriesByType('navigation')[0] && performance.getEntriesByType('navigation')[0].toJSON(),
        transferBytes: performance.getEntriesByType('resource').reduce(function(total, entry){ return total + Math.max(entry.transferSize || 0, entry.encodedBodySize || 0); }, 0) + Math.max((performance.getEntriesByType('navigation')[0] || {}).transferSize || 0, (performance.getEntriesByType('navigation')[0] || {}).encodedBodySize || 0),
        paints: Object.fromEntries(performance.getEntriesByType('paint').map(function(entry){ return [entry.name, entry.startTime]; })),
        longTasks: window.__forgeLongTasks || [],
        url: location.href
      })`
    }, sessionId)
  ]);
  const browser = JSON.parse(runtime.result.value);
  const metric = Object.fromEntries(metrics.map(item => [item.name, item.value]));
  let transferBytes = 0;
  let requestCount = 0;
  for (const [requestId, response] of responses) {
    if (!response.url.startsWith(`http://127.0.0.1:${PORT}/`)) continue;
    transferBytes += finished.get(requestId) || 0;
    requestCount += 1;
  }
  await cdp.send('Target.closeTarget', {targetId});
  const nav = browser.navigation || {};
  if (exceptions.length) throw new Error(`${route} raised a browser exception: ${exceptions.join('; ')}`);
  return {
    transferKiB: (browser.transferBytes || transferBytes) / 1024,
    fcpMs: browser.paints['first-contentful-paint'] || 0,
    domContentLoadedMs: nav.domContentLoadedEventEnd || 0,
    loadMs: nav.loadEventEnd || 0,
    scriptMs: (metric.ScriptDuration || 0) * 1000,
    taskMs: (metric.TaskDuration || 0) * 1000,
    tbtMs: browser.longTasks.reduce((total, duration) => total + Math.max(0, duration - 50), 0),
    heapMiB: (metric.JSHeapUsedSize || 0) / 1024 / 1024,
    requests: requestCount,
    finalUrl: browser.url
  };
}

async function main() {
  if (!fs.existsSync(path.join(SITE, 'index.html'))) throw new Error('Run npm run pages:build before benchmarking.');
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome was not found at ${CHROME}. Set FORGE_CHROME to its executable.`);
  const server = await startServer();
  const chrome = await launchChrome();
  const cdp = connect(chrome.webSocketUrl);
  await cdp.ready;
  const result = {configuration: {runs: RUNS, cpuSlowdown: 4, latencyMs: 80, downloadKbps: 10000, cache: 'disabled'}, routes: {}};
  try {
    for (const route of ROUTES) {
      const samples = [];
      for (let run = 0; run < RUNS; run += 1) samples.push(await benchmarkRoute(cdp, route));
      result.routes[route] = {median: summarize(samples), samples};
      console.log(`${route}: ${JSON.stringify(result.routes[route].median)}`);
    }
    if (process.env.FORGE_PERF_OUTPUT) fs.writeFileSync(process.env.FORGE_PERF_OUTPUT, `${JSON.stringify(result, null, 2)}\n`);
  } finally {
    cdp.close();
    const chromeExited = new Promise(resolve => chrome.child.once('exit', resolve));
    chrome.child.kill('SIGKILL');
    server.close();
    server.closeAllConnections();
    await chromeExited;
    fs.rmSync(chrome.profile, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
  }
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
