#!/usr/bin/env node
/* A student in two classes keeps both, and sees one combined history.
 *
 * Regression: every page called ForgeClasses.syncFromServer with the active
 * class, and it rebuilt the student's class list as that one class. A student
 * in Chemistry who joined Psychology lost Chemistry from Practice, Home and
 * Profile on the next page load. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function page() {
  const store = {};
  const calls = [];
  const ctx = {
    console,
    localStorage: {
      getItem: key => (key in store ? store[key] : null),
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: key => { delete store[key]; }
    }
  };
  ctx.window = ctx;
  ctx.ForgeAPI = { rpc: () => Promise.resolve([]) };
  ctx.ForgeStudentCode = {
    responses(studentId, classCode, studentCode) {
      calls.push({ studentId, classCode, studentCode });
      if (ctx.failClass === classCode) return Promise.reject(new Error('read failed'));
      return Promise.resolve([{ id: 'r-' + studentId, student_id: studentId, bank: classCode === 'CHEM-12' ? 'CHEM-1' : 'PSYCH-1', created_at: classCode === 'CHEM-12' ? '2026-10-01' : '2026-10-02' }]);
    }
  };
  vm.createContext(ctx);
  for (const file of ['scripts/forge-classes.js', 'scripts/forge-rewards.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return { ctx, store, calls, C: ctx.ForgeClasses };
}

const chem = { classId: 'c-chem', classCode: 'CHEM-12', className: '12C/Ch', subject: 'chem', studentId: 's-chem', studentName: 'Isaac N', studentCode: 'AAAA1111' };
const psych = { classId: 'c-psych', classCode: 'PSY-12', className: '12C/Py', subject: 'psych', studentId: 's-psych', studentName: 'Isaac N', studentCode: 'BBBB2222' };

(async () => {
  // The reported sequence: in Chemistry, join Psychology, open another page.
  {
    const { C } = page();
    C.adopt({ studentId: chem.studentId, classId: chem.classId, classCode: chem.classCode, studentCode: chem.studentCode, studentName: chem.studentName, classSubject: 'chem', className: chem.className });
    C.add(psych);
    // Pages pass only id, code and name; this used to drop Chemistry.
    C.syncFromServer('', '', { studentId: psych.studentId, classCode: psych.classCode, studentName: 'Isaac N', studentCode: psych.studentCode });
    assert.deepStrictEqual(C.list().map(c => c.subject).join(','), 'chem,psych', 'joining a second class keeps the first');
    assert.deepStrictEqual(C.subjects({ chem: {}, psych: {} }).join(','), 'chem,psych');
    const p = C.forClass('c-psych');
    assert.strictEqual(p.className, '12C/Py', 'a partial anchor does not blank fields the list already has');
    assert.strictEqual(p.subject, 'psych');
    assert.strictEqual(C.list().length, 2, 'no duplicate entry for the anchored class');
  }

  // A device the old code already damaged: one entry with no class id. Adopting
  // the saved session repairs it instead of adding a duplicate.
  {
    const { C, store } = page();
    store['forge-classes'] = JSON.stringify([{ classId: null, classCode: 'PSY-12', className: null, subject: null, studentId: 's-psych', studentName: 'Isaac N', studentCode: null }]);
    C.adopt({ studentId: 's-psych', classId: 'c-psych', classCode: 'PSY-12', studentCode: 'BBBB2222', studentName: 'Isaac N', classSubject: 'psych' });
    assert.strictEqual(C.list().length, 1, 'repaired in place');
    assert.strictEqual(C.list()[0].classId, 'c-psych');
    assert.strictEqual(C.list()[0].subject, 'psych');
    assert.strictEqual(C.list()[0].studentCode, 'BBBB2222');
  }

  // Another student on the same device is untouched; an unknown anchor is added.
  {
    const { C } = page();
    C.add(chem);
    C.add(Object.assign({}, psych, { studentName: 'Someone Else', studentId: 's-other' }));
    C.syncFromServer('', '', { studentId: 's-new', classCode: 'BIO-12', studentName: 'Isaac N' });
    C.use('Isaac N');
    assert.strictEqual(C.list().length, 2);
    C.use('Someone Else');
    assert.strictEqual(C.list().length, 1);
  }

  // Home, Profile, Repair and Practice read every class, each with its own codes.
  {
    const { C, calls } = page();
    C.add(chem); C.add(psych);
    const rows = await new Promise(done => C.fetchStudentResponses('', '', { studentId: psych.studentId, classCode: psych.classCode, studentCode: psych.studentCode, studentName: 'Isaac N' }, (r, e) => done({ r, e })));
    assert.strictEqual(rows.e, null);
    assert.strictEqual(rows.r.length, 2, 'answers from both classes');
    assert.strictEqual(rows.r[0]._classId, 'c-chem', 'oldest first, tagged with its class');
    assert.strictEqual(rows.r[1]._subject, 'psych');
    assert.deepStrictEqual(calls.map(c => c.classCode + ':' + c.studentCode).sort().join(','), 'CHEM-12:AAAA1111,PSY-12:BBBB2222', "each class is read with that class's own codes");
  }

  // A failed read is reported, not shown as a shorter history.
  {
    const { C, ctx } = page();
    C.add(chem); C.add(psych);
    ctx.failClass = 'CHEM-12';
    const out = await new Promise(done => C.fetchStudentResponses('', '', { studentId: psych.studentId, classCode: psych.classCode, studentCode: psych.studentCode, studentName: 'Isaac N' }, (r, e) => done({ r, e })));
    assert.strictEqual(out.r.length, 1);
    assert(out.e, 'the error reaches the page');
  }

  // Switching class makes it the one new answers are saved against.
  {
    const { C, store } = page();
    C.add(chem); C.add(psych);
    C.activate(C.forClass('c-chem'), { isGCSE: false });
    const session = JSON.parse(store['forge-student']);
    assert.strictEqual(session.studentId, 's-chem');
    assert.strictEqual(session.classCode, 'CHEM-12');
    assert.strictEqual(session.studentCode, 'AAAA1111');
    assert.strictEqual(session.classSubject, 'chem');
  }

  // Rank counts match XP from every class row.
  {
    const { C, ctx, store } = page();
    C.add(chem); C.add(psych);
    store['forge-rewards:s-chem'] = JSON.stringify({ serverMatchXp: 40, quizXp: 100 });
    store['forge-rewards:s-psych'] = JSON.stringify({ serverMatchXp: 20 });
    store['forge-rewards:s-free'] = JSON.stringify({ serverMatchXp: 500 });
    assert.strictEqual(ctx.ForgeRewards.matchXpFor('s-psych'), 60);
    assert.strictEqual(ctx.ForgeRewards.total('s-chem'), 160);
    assert.strictEqual(ctx.ForgeRewards.matchXpFor('s-free'), 500, 'a student id outside the class list counts only itself');
  }

  // The pages use the combined read, and Repair writes with the mistake's class codes.
  {
    for (const file of ['pages/app/student-dashboard.html', 'pages/app/profile.html', 'pages/app/anvil.html', 'pages/app/forge-quiz.html', 'pages/app/student-settings.html']) {
      const html = fs.readFileSync(file, 'utf8');
      assert(!html.includes('fetchLinkedResponses('), file + ' should read every class');
    }
    const anvil = fs.readFileSync('pages/app/anvil.html', 'utf8');
    assert(anvil.includes('classCode: mClass?mClass.classCode:anvilState.classCode'), 'a repair saves against the class the mistake came from');
    const home = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
    assert(home.includes('classSwitcherHtml()'), 'Home offers the class switcher');
  }

  console.log('Multi-class tests passed (joining keeps every class, combined history with per-class codes, switching, XP, repair writes).');
})().catch(error => { console.error(error); process.exit(1); });
