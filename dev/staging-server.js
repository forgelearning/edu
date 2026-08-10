#!/usr/bin/env node
/*
 * Local staging harness for browser-level failure testing.
 * Serves the real Forge pages while replacing ForgeAPI with a controlled mock.
 * Nothing from this server is included in the production Pages artifact.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(path.resolve(__dirname, '..'), '_site');
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const port = Number(args.get('--port') || 4174);
const failureAfter = Number(args.get('--failure-after') || 0);
const mode = args.get('--mode') || 'save-failure';
let responseCount = 0;

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*'
  });
  res.end(payload);
}

function apiScript() {
  return `(function(root){
    var base = 'http://127.0.0.1:${port}/mock-supabase';
    function request(path, options) {
      options = options || {};
      return fetch(base + path, options).then(function(response){
        return response.text().then(function(text){
          var body = text ? JSON.parse(text) : null;
          if (!response.ok) { var error = new Error((body && body.message) || 'Staging API failure'); error.status = response.status; error.body = body; throw error; }
          return body;
        });
      });
    }
    root.ForgeAPI = {
      config: {url: base, key: 'staging-anon-key'},
      request: request,
      rpc: function(name, payload){ return request('/rest/v1/rpc/' + name, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload || {})}); },
      insert: function(name, row){ return request('/rest/v1/' + name, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(row || {})}); },
      response: function(url, options){ return request(url.replace(base, ''), options); },
      get: function(){ return Promise.resolve([]); },
      patch: function(){ return Promise.resolve([]); },
      remove: function(){ return Promise.resolve([]); },
      auth: {
        signUp: function(){ return Promise.reject(new Error('Staging auth is intentionally disabled')); },
        signIn: function(){ return Promise.reject(new Error('Staging auth is intentionally disabled')); },
        refresh: function(){ return Promise.reject(new Error('Staging auth is intentionally disabled')); },
        user: function(){ return Promise.reject(new Error('Staging auth is intentionally disabled')); },
        updatePassword: function(){ return Promise.reject(new Error('Staging auth is intentionally disabled')); },
        signOut: function(){ return Promise.resolve(null); },
        recover: function(){ return Promise.resolve(null); }
      }
    };
    root.SUPABASE_URL = base;
    root.SUPABASE_KEY = 'staging-anon-key';
  }(window));`;
}

function serveFile(req, res, pathname) {
  if (pathname === '/scripts/forge-api.js') {
    res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store'});
    res.end(apiScript());
    return;
  }
  const relative = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(root, '.' + relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const ext = path.extname(file);
  const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
  res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || 'authorization, apikey, content-type, prefer',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }
  if (url.pathname === '/mock-supabase/rest/v1/rpc/record_free_response') {
    responseCount += 1;
    if (mode === 'quota') return json(res, 200, {allowed:false, reason:'daily_limit', used:10});
    if (mode === 'network-failure' || (failureAfter > 0 && responseCount > failureAfter)) return json(res, 503, {message:'Staging API is intentionally unavailable'});
    return json(res, 200, {allowed:true, id:'staging-response-' + responseCount, used:responseCount});
  }
  if (url.pathname.startsWith('/mock-supabase/')) return json(res, 200, []);
  serveFile(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log('Forge staging harness: http://127.0.0.1:' + port + '/forge-quiz.html');
  console.log('Mode: ' + mode + (failureAfter ? ' (fails after ' + failureAfter + ' response(s))' : ''));
});
