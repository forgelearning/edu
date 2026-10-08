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
const demoStudent = {studentId:'local-motion-student',classId:'local-motion-class',classCode:'LOCAL-MOTION',studentCode:'LOCAL123',studentName:'Motion Tester',classSubject:'gcse-geo'};
const demoResponses = [];
const demoFreeResponses = [];
const demoCards = new Map();
const demoMatchRewards = new Map();
// Starting match XP for the demo student. /test-account?matchxp=4990 starts
// them just below a rank so a single correct answer crosses it.
let demoStartingMatchXp = 3000;
let demoTrophies = 0;

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
      response: function(url, options){
        return request(url.replace(base, ''), options).then(function(body){
          return { ok: true, status: 200, json: function () { return Promise.resolve(body); }, text: function () { return Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)); } };
        });
      },
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

// /test-account?history=1 starts the demo student with a few weeks of practice,
// so the profile's achievement badges show a mix of tiers. Deterministic, so
// the same badges appear every time.
function seedDemoHistory() {
  const banks = ['GCSE-GEO-HAZ', 'GCSE-GEO-CLIMATE', 'GCSE-GEO-DEV', 'GCSE-GEO-URB'];
  const row = (n, daysAgo, o) => Object.assign({
    id:'local-motion-history-'+n, student_id:demoStudent.studentId, class_id:demoStudent.classId,
    question_id:'HIST-'+n, bank:banks[n % banks.length], subject:demoStudent.classSubject, selected_option:'A',
    is_correct:true, misconception_tag:null, spec_point:null, reforge_attempted:false, reforge_correct:null,
    assignment_id:null, hint_used:false, created_at:new Date(Date.now() - daysAgo * 86400000).toISOString()
  }, o);
  let n = 0;
  // Eight practice days in a row ending three weeks ago, then three recent days.
  [28,27,26,25,24,23,22,21,3,2,1].forEach(daysAgo => {
    for (let i = 0; i < 12; i++) demoResponses.push(row(n++, daysAgo, {is_correct:(n % 5) !== 0}));
    demoResponses.push(row(n++, daysAgo, {reforge_attempted:true, reforge_correct:true}));
  });
  for (let i = 0; i < 14; i++) demoResponses.push(row(n++, 2, {question_id:'TIMED-'+i+'-CRU', is_correct:i % 4 !== 0}));
}

// /test-account?all=1 starts the demo student with everything unlocked: Master
// rank and every legendary avatar (20,000 XP), five league trophies, and Gold in
// all seven achievement badges, so every avatar and appearance can be tried.
// The history uses real GCSE Geography questions and misconception tags, so
// topic names and cleared misconceptions read as they would for a student.
function seedCompleteHistory() {
  const vm = require('vm');
  const ctx = {window:{}}; ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'forge-data.js'), 'utf8') + ';window.__S=SUBJECTS;window.__B=BANKS;', ctx);
  const banks = ctx.window.__S[demoStudent.classSubject].banks.filter(b => ctx.window.__B[b]);
  const questions = b => (ctx.window.__B[b].questions || []).filter(q => q.id && q.correct);
  const tagOf = q => Array.isArray(q.tag) ? q.tag[0] : q.tag;
  const rows = [];
  const add = (o) => rows.push(Object.assign({student_id:demoStudent.studentId, class_id:demoStudent.classId, subject:demoStudent.classSubject,
    selected_option:'A', is_correct:true, misconception_tag:null, spec_point:null, reforge_attempted:false, reforge_correct:null, assignment_id:null, hint_used:false}, o));
  // 32 misconceptions met and then cleared: a wrong answer, then four right
  // similar questions (Gold needs 30 cleared and 100 repairs).
  const tagged = [], seen = new Set();
  banks.forEach(b => questions(b).forEach(q => { const t = tagOf(q); if (t && !seen.has(t)) { seen.add(t); tagged.push({b, q, t}); } }));
  const cleared = tagged.slice(0, 32);
  cleared.forEach(({b, q, t}) => add({question_id:q.id, bank:b, selected_option:q.correct === 'A' ? 'B' : 'A', is_correct:false, misconception_tag:t}));
  cleared.forEach(({b, q, t}) => { for (let i = 0; i < 4; i++) add({question_id:q.id + '-RF', bank:b, misconception_tag:t, reforge_attempted:true, reforge_correct:true}); });
  // 40 right first answers in every topic (Gold: 500 answers, every topic explored and sharpened).
  banks.forEach(b => { const qs = questions(b); for (let i = 0; i < 40; i++) add({question_id:qs[i % qs.length].id, bank:b}); });
  // 210 right answers in Timed practice (Gold: 200).
  for (let i = 0; i < 210; i++) { const b = banks[i % banks.length], qs = questions(b); add({question_id:qs[i % qs.length].id + '-CRU', bank:b}); }
  // Spread over the last 24 days in order, so every day has practice (Gold
  // streak: 21) and each misconception's error comes before its repairs.
  const days = 24, start = Date.now() - (days - 1) * 86400000 - 3600000;
  rows.forEach((r, n) => {
    r.id = 'local-motion-all-' + n;
    r.created_at = new Date(start + Math.floor(n * days / rows.length) * 86400000 + (n % 40) * 60000).toISOString();
    demoResponses.push(r);
  });
}

function serveDemoAccount(res, url) {
  demoResponses.length = 0;
  const all = !!(url && url.searchParams.get('all') === '1');
  const xpParam = url && url.searchParams.get('matchxp'), trophyParam = url && url.searchParams.get('trophies');
  const startXp = Number(xpParam);
  demoStartingMatchXp = xpParam !== null && Number.isInteger(startXp) && startXp >= 0 && startXp <= 100000 ? startXp : all ? 20000 : 3000;
  const trophies = Number(trophyParam);
  demoTrophies = trophyParam !== null && Number.isInteger(trophies) && trophies >= 0 && trophies <= 50 ? trophies : all ? 5 : 0;
  if (all) seedCompleteHistory();
  else if (url && url.searchParams.get('history') === '1') seedDemoHistory();
  demoMatchRewards.clear();
  const session = JSON.stringify(demoStudent);
  const html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Forge test student</title><p>Opening Forge as a local test student…</p><script>'
    + '["forge-free-session","forge-paid-student","forge-teacher-session","forge-active-role","forge-auth-session"].forEach(function(key){localStorage.removeItem(key)});'
    + 'Object.keys(localStorage).filter(function(key){return key.indexOf("forge-session:local-motion-student:")===0||key.indexOf("forge-crucible-run:local-motion-student:")===0||key==="forge-revision:local-motion-student"||key==="forge-celebrated:local-motion-student"}).forEach(function(key){localStorage.removeItem(key)});'
    + 'localStorage.setItem("forge-student",'+JSON.stringify(session)+');'
    + 'localStorage.setItem("forge-rewards:local-motion-student",JSON.stringify({quizXp:0,serverMatchXp:'+demoStartingMatchXp+',pending:[],rounds:{}}));'
    + 'localStorage.setItem("forge-classes",JSON.stringify([{classId:"local-motion-class",classCode:"LOCAL-MOTION",className:"Motion test class",subject:"gcse-geo",studentId:"local-motion-student",studentName:"Motion Tester",studentCode:"LOCAL123"}]));'
    + 'location.replace(' + JSON.stringify(all ? '/profile.html' : '/forge-quiz.html?subject=gcse-geo') + ');'
    + '</script></html>';
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(html);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (mode === 'student-demo' && url.pathname === '/test-account') return serveDemoAccount(res, url);
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
  if (url.pathname === '/mock-supabase/rest/v1/rpc/create_free_student') {
    if (mode === 'network-failure') return json(res, 503, {message:'Staging API is intentionally unavailable'});
    return json(res, 200, [{student_id: 'staging-free-student-1'}]);
  }
  if (url.pathname === '/mock-supabase/rest/v1/rpc/record_free_response') {
    responseCount += 1;
    if (mode === 'quota') return json(res, 200, {allowed:false, reason:'cooldown', limit:10, retry_at:new Date(Date.now()+30*60*1000).toISOString()});
    if (mode === 'network-failure' || (failureAfter > 0 && responseCount > failureAfter)) return json(res, 503, {message:'Staging API is intentionally unavailable'});
    if (mode === 'student-demo') {
      let raw='';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        let body={};try{body=JSON.parse(raw||'{}');}catch(e){}
        demoFreeResponses.push({id:'local-free-response-'+demoFreeResponses.length,student_id:body.p_student_id,class_id:null,question_id:body.p_question_id,bank:body.p_bank,subject:body.p_subject,selected_option:body.p_selected_option,is_correct:!!body.p_is_correct,misconception_tag:body.p_misconception_tag||null,reforge_attempted:!!body.p_reforge_attempted,created_at:new Date().toISOString()});
        json(res, 200, {allowed:true, id:'local-free-response-'+demoFreeResponses.length,used:demoFreeResponses.length});
      });
      return;
    }
    return json(res, 200, {allowed:true, id:'staging-response-' + responseCount, used:responseCount});
  }
  if (mode === 'student-demo') {
    // Accepted friends at every rank, so the avatar frames can be seen together.
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_class_friends') {
      const friend = (n, name, week, total, accuracy, streak) => ({student_id:'local-friend-'+n, name, xp_week:week, xp_total:total, answered:Math.round(total/9), accuracy, streak});
      return json(res, 200, {enabled:true, incoming:[], outgoing:[], classmates:[], friends:[
        friend(1, 'Amira K.', 340, 16200, 88, 41), friend(2, 'Josh T.', 210, 6400, 79, 12),
        friend(3, 'Priya S.', 95, 2100, 71, 5), friend(4, 'Leo M.', 60, 650, 64, 2), friend(5, 'Sam R.', 20, 90, 58, 0)
      ]});
    }
    // A weekly league whose rows carry rank keys and trophy counts, as
    // get_class_weekly_league returns them since 20261008123202_league_trophies.sql.
    // /test-account?trophies=2 gives the demo student two weekly wins.
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_class_weekly_league') {
      const row = (seq, position, name, xp, rank, trophies, isYou) => ({seq, position, name, xp, rank, trophies, is_you: !!isYou});
      return json(res, 200, {enabled:true, ranked:9, trophies:demoTrophies, you:{position:4, xp:180, rank:'craftsman', trophies:demoTrophies}, rows:[
        row(1, 1, 'Amira K.', 340, 'master', 3), row(2, 2, 'Josh T.', 210, 'forged', 1), row(3, 3, 'Priya S.', 195, 'craftsman', 0),
        row(4, 4, 'Motion T.', 180, 'craftsman', demoTrophies, true), row(5, 5, 'Leo M.', 60, 'journeyman', 0), row(6, 6, 'Sam R.', 20, 'apprentice', 0)
      ]});
    }
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_student_match_xp') {
      return json(res, 200, {xp_total:demoStartingMatchXp+[...demoMatchRewards.values()].reduce((xp, reward) => xp + reward.xp, 0)});
    }
    if (url.pathname === '/mock-supabase/rest/v1/rpc/claim_student_match_xp') {
      let raw='';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        let body={};try{body=JSON.parse(raw||'{}');}catch(e){}
        if (body.p_student_id !== demoStudent.studentId || ![3,4].includes(body.p_pairs)) return json(res, 400, {message:'Invalid match reward'});
        const rewardKey=body.p_day+'|'+body.p_bank;
        const awarded=!demoMatchRewards.has(rewardKey);
        if (awarded) demoMatchRewards.set(rewardKey,{xp:body.p_pairs*5});
        json(res, 200, {awarded, xp:awarded?body.p_pairs*5:0, xp_total:demoStartingMatchXp+[...demoMatchRewards.values()].reduce((xp, reward) => xp + reward.xp, 0)});
      });
      return;
    }
    if (url.pathname === '/mock-supabase/rest/v1/rpc/manage_student_revision_card') {
      let raw='';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        let body={};try{body=JSON.parse(raw||'{}');}catch(e){}
        const studentId=String(body.p_student_id||'');
        if (!studentId) return json(res, 400, {message:'Missing student'});
        const cards=demoCards.get(studentId)||new Map();
        if (body.p_action === 'list') return json(res, 200, [...cards.values()]);
        const card=body.p_card||{};
        if (!card.id) return json(res, 400, {message:'Missing card'});
        if (body.p_action === 'save') cards.set(card.id,{...card,review:body.p_review||null});
        else if (body.p_action === 'delete') cards.delete(card.id);
        else return json(res, 400, {message:'Unknown action'});
        demoCards.set(studentId,cards);
        json(res, 200, {ok:true});
      });
      return;
    }
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_free_student_responses') return json(res, 200, demoFreeResponses);
    if (url.pathname === '/mock-supabase/rest/v1/rpc/join_class_with_student_code') return json(res, 200, [{student_id:demoStudent.studentId,class_id:demoStudent.classId,class_name:'Motion test class',subject:demoStudent.classSubject}]);
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_student_own_responses_with_code') return json(res, 200, demoResponses);
    // As in production since 20260810133000: the legacy RPC answers [] for a
    // class that uses student codes, which the demo class does. Answering it
    // with the history hid a quiz page that never sent the code.
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_student_own_responses') return json(res, 200, []);
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_student_assignments') return json(res, 200, []);
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_challenge_answers') {
      // Mirrors the server's answer-first rule, then reports a pretend class of
      // six: the demo student's own answer plus five classmates.
      let raw='';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        let body={};try{body=JSON.parse(raw||'{}');}catch(e){}
        const mine=demoResponses.find(r=>r.question_id===body.p_question_id&&r.assignment_id===body.p_assignment_id&&!r.reforge_attempted);
        if(!mine) return json(res, 200, {allowed:false,reason:'answer_first'});
        const options={A:1,B:2,C:1,D:1};
        options[mine.selected_option]=(options[mine.selected_option]||0)+1;
        json(res, 200, {allowed:true,answered:6,options});
      });
      return;
    }
    if (url.pathname === '/mock-supabase/rest/v1/rpc/get_class_by_code') return json(res, 200, [{id:demoStudent.classId,name:'Motion test class',subject:demoStudent.classSubject}]);
    if (url.pathname === '/mock-supabase/rest/v1/rpc/record_revision_review_with_code') return json(res, 200, {allowed:true});
    if (url.pathname === '/mock-supabase/rest/v1/rpc/record_student_response_with_code') {
      let raw='';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        let body={};try{body=JSON.parse(raw||'{}');}catch(e){}
        demoResponses.push({
          id:'local-motion-response-'+(demoResponses.length+1),
          student_id:demoStudent.studentId,class_id:demoStudent.classId,
          question_id:body.p_question_id,bank:body.p_bank,subject:body.p_subject,
          selected_option:body.p_selected_option,is_correct:!!body.p_is_correct,
          misconception_tag:body.p_misconception_tag||null,spec_point:body.p_spec_point||null,
          reforge_attempted:!!body.p_reforge_attempted,reforge_correct:body.p_reforge_correct,
          assignment_id:body.p_assignment_id||null,hint_used:!!body.p_hint_used,created_at:new Date().toISOString()
        });
        json(res, 200, {allowed:true});
      });
      return;
    }
  }
  if (url.pathname.startsWith('/mock-supabase/')) return json(res, 200, []);
  serveFile(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log('Forge staging harness: http://127.0.0.1:' + port + '/forge-quiz.html');
  console.log('Mode: ' + mode + (failureAfter ? ' (fails after ' + failureAfter + ' response(s))' : ''));
});
