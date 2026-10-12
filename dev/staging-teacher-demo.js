/*
 * Teacher demo data for the staging harness (`--mode teacher-demo`).
 *
 * Open /teacher-account to sign in as a local demo teacher with three classes,
 * a few weeks of class answers built from real question ids and misconception
 * tags, and some assignments, so the teacher dashboard can be seen and tested
 * with realistic content. Deterministic: the same data appears every time.
 * Nothing here is included in the production Pages artifact.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TEACHER = { id: 'demo-teacher', email: 'teacher@example.test' };
const DAY = 86400000;

function loadBank() {
  const ctx = { window: {} }; ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'forge-data.js'), 'utf8') + ';window.__S=SUBJECTS;window.__B=BANKS;', ctx);
  return { SUBJECTS: ctx.window.__S, BANKS: ctx.window.__B };
}

// Small seeded PRNG so every run builds the same class.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const NAMES = ['Amira Khan', 'Josh Taylor', 'Priya Shah', 'Leo Morgan', 'Sam Reid', 'Isaac Novak', 'Ella Brooks', 'Noah Patel',
  'Grace Okafor', 'Ruby Evans', 'Theo Wright', 'Maya Chen', 'Oscar Hughes', 'Zara Ahmed', 'Finn Walsh', 'Lily Turner',
  'Ade Bello', 'Chloe Price'];

function build() {
  const { SUBJECTS, BANKS } = loadBank();
  const now = Date.now();
  const classes = [
    { id: 'demo-class-econ12', name: 'Year 12 Economics', subject: 'econ', code: 'ECON-Y12', league_enabled: true, friends_enabled: true, size: 18, banks: 5, seed: 7 },
    { id: 'demo-class-econ13', name: 'Year 13 Economics', subject: 'econ', code: 'ECON-Y13', league_enabled: false, friends_enabled: false, size: 12, banks: 8, seed: 11 },
    { id: 'demo-class-geo10', name: '10G Geography', subject: 'gcse-geo', code: 'GEO-10G', league_enabled: true, friends_enabled: false, size: 15, banks: 4, seed: 19 }
  ];
  const students = [], responses = [], assignments = [], friendships = [];

  classes.forEach((cls, ci) => {
    const rand = rng(cls.seed);
    const banks = SUBJECTS[cls.subject].banks.filter(b => BANKS[b]).slice(0, cls.banks);
    const pool = banks.flatMap(b => (BANKS[b].questions || []).filter(q => q.id && q.correct).map(q => ({ b, q })));
    const roster = NAMES.slice(0, cls.size).map((name, i) => ({
      id: cls.id + '-s' + i, name, display_name: null, class_id: cls.id, extra_time: i === 3 ? 25 : 0,
      created_at: new Date(now - 40 * DAY).toISOString(), auth_user_id: null, link_group: null
    }));
    students.push(...roster);
    cls.created_at = new Date(now - (60 - ci) * DAY).toISOString();
    cls.teacher_user_id = TEACHER.id;
    cls.school = 'Demo School';

    roster.forEach((s, si) => {
      // A spread of engagement: a few very active, most steady, two barely started.
      const activity = si < 3 ? 1 : si > cls.size - 3 ? 0.08 : 0.35 + rand() * 0.4;
      const skill = 0.45 + rand() * 0.45;
      for (let d = 20; d >= 0; d--) {
        if (rand() > activity) continue;
        const count = 4 + Math.floor(rand() * 10);
        for (let k = 0; k < count; k++) {
          const { b, q } = pool[Math.floor(rand() * pool.length)];
          const correct = rand() < skill;
          const tag = Array.isArray(q.tag) ? q.tag[0] : q.tag;
          const at = now - d * DAY - Math.floor(rand() * 8) * 3600000;
          const wrongOption = ['A', 'B', 'C', 'D'].filter(o => o !== q.correct)[Math.floor(rand() * 3)];
          responses.push({
            id: s.id + '-r' + responses.length, student_id: s.id, class_id: cls.id, question_id: q.id, bank: b,
            subject: cls.subject, selected_option: correct ? q.correct : wrongOption, is_correct: correct,
            misconception_tag: correct ? null : tag || null, spec_point: q.spec || null,
            reforge_attempted: false, reforge_correct: null, assignment_id: null, hint_used: false,
            created_at: new Date(at).toISOString()
          });
          if (!correct && rand() < 0.6) {
            responses.push({
              id: s.id + '-r' + responses.length, student_id: s.id, class_id: cls.id, question_id: q.id, bank: b,
              subject: cls.subject, selected_option: q.correct, is_correct: true, misconception_tag: tag || null,
              spec_point: q.spec || null, reforge_attempted: true, reforge_correct: rand() < 0.7,
              assignment_id: null, hint_used: false, created_at: new Date(at + 60000).toISOString()
            });
          }
        }
      }
    });

    assignments.push(
      { id: cls.id + '-a1', class_id: cls.id, title: 'Weekly practice: ' + BANKS[banks[0]].label, banks: [banks[0]], due_date: new Date(now + 3 * DAY).toISOString().slice(0, 10), archived: false, challenge_question_ids: null, created_at: new Date(now - 4 * DAY).toISOString() },
      { id: cls.id + '-a2', class_id: cls.id, title: 'Revision before the mock', banks: banks.slice(1, 3), due_date: new Date(now + 9 * DAY).toISOString().slice(0, 10), archived: false, challenge_question_ids: null, created_at: new Date(now - 2 * DAY).toISOString() },
      { id: cls.id + '-a3', class_id: cls.id, title: 'Catch-up: ' + BANKS[banks[1]].label, banks: [banks[1]], due_date: new Date(now - 5 * DAY).toISOString().slice(0, 10), archived: false, challenge_question_ids: null, created_at: new Date(now - 12 * DAY).toISOString() }
    );
    if (cls.friends_enabled) {
      [[0, 1], [0, 2], [3, 4], [5, 6]].forEach(([a, b], i) => friendships.push({
        id: cls.id + '-f' + i, class_id: cls.id, requester_id: roster[a].id, addressee_id: roster[b].id,
        status: i === 3 ? 'pending' : 'accepted', created_at: new Date(now - (10 - i) * DAY).toISOString(), responded_at: null
      }));
    }
  });
  classes.forEach(c => { delete c.size; delete c.banks; delete c.seed; });
  return { classes, students, responses, assignments, friendships };
}

let data = null;
function demo() { return data || (data = build()); }

// PostgREST-style filters the dashboard uses: col=eq.x, col=in.(a,b), order=col.dir
function filterRows(rows, params) {
  let out = rows.slice();
  for (const [key, value] of params) {
    if (key === 'order') {
      const [col, dir] = value.split('.');
      out.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
    } else if (value.startsWith('eq.')) {
      const v = decodeURIComponent(value.slice(3));
      out = out.filter(r => String(r[key]) === v);
    } else if (value.startsWith('in.(')) {
      const set = new Set(value.slice(4, -1).split(','));
      out = out.filter(r => set.has(String(r[key])));
    }
  }
  return out;
}

function accountPage() {
  data = null;
  const session = JSON.stringify({ access_token: 'demo-teacher-token', refresh_token: 'demo', user: TEACHER });
  return '<!doctype html><html lang="en"><meta charset="utf-8"><title>Forge test teacher</title><p>Opening Forge as a local test teacher…</p><script>'
    + 'localStorage.setItem("forge-teacher-session",' + JSON.stringify(session) + ');'
    + 'localStorage.setItem("forge-active-role","teacher");'
    + 'localStorage.removeItem("forge-teacher-joined-classes-demo-teacher");'
    + 'location.replace("/teacher.html");'
    + '</script></html>';
}

/* Returns [status, body] for a mock-supabase request, or null if unhandled. */
function handle(url, method) {
  const p = url.pathname.replace('/mock-supabase', '');
  const d = demo();
  if (p === '/auth/v1/user') return [200, TEACHER];
  if (method === 'GET' && p.startsWith('/rest/v1/')) {
    const table = p.slice('/rest/v1/'.length);
    const source = { classes: d.classes, students: d.students, responses: d.responses, assignments: d.assignments, student_friendships: d.friendships, revision_reviews: [] }[table];
    if (source) return [200, filterRows(source, url.searchParams)];
  }
  if (method === 'PATCH' && p.startsWith('/rest/v1/')) return [200, []];
  const rpc = p.startsWith('/rest/v1/rpc/') ? p.slice('/rest/v1/rpc/'.length) : null;
  if (rpc === 'get_teacher_profile') return [200, { provisioned: true, school: 'Demo School' }];
  if (rpc === 'class_student_code_coverage') return [200, [{ students: 18, with_code: 18 }]];
  if (rpc === 'get_teacher_class_match_rewards') return [200, []];
  if (rpc === 'get_teacher_adoption_snapshot') {
    const recent = d.responses.filter(r => Date.parse(r.created_at) > Date.now() - 30 * DAY && !r.reforge_attempted);
    return [200, { authorized: true, classes: d.classes.length, active_students_30d: new Set(recent.map(r => r.student_id)).size,
      accuracy_30d: Math.round(100 * recent.filter(r => r.is_correct).length / Math.max(1, recent.length)), responses: recent.length, assignments: d.assignments.length }];
  }
  if (rpc === 'reset_student_access_code') return [200, [{ student_id: 'x', student_name: 'Demo student', student_code: 'A1B2C3D4E5', class_code: 'ECON-Y12' }]];
  if (rpc === 'generate_student_access_codes') return [200, Array.from({ length: 3 }, (_, i) => ({ student_code: 'DEMO' + i + 'CODE00', class_code: 'ECON-Y12' }))];
  if (rpc === 'generate_student_access_codes_for_existing_students') return [200, []];
  return null;
}

module.exports = { handle, accountPage, TEACHER };
