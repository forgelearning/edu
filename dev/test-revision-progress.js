#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const server = { reviews: {}, assignments: {} };
const assignmentId = '11111111-1111-4111-8111-111111111111';
const student = { studentId: 'student-1', classCode: 'CLASS', studentCode: '1234' };
function device() {
  let offline = false;
  const storage = new Map();
  const window = {
    Promise, JSON, String, Date, Object,
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    ForgePersonalCards: { canSync() { return true; } },
    ForgeAPI: {
      config: { key: 'public-key' },
      rpc(name, input) {
        assert.strictEqual(name, 'sync_student_revision_progress');
        assert.strictEqual(input.p_student_code, '1234');
        if (offline) return Promise.reject(new Error('offline'));
        Object.entries(input.p_reviews).forEach(([key, value]) => {
          assert(!key.startsWith('personal|'));
          if (!server.reviews[key] || Date.parse(value.updatedAt) > Date.parse(server.reviews[key].updatedAt)) server.reviews[key] = value;
        });
        Object.entries(input.p_assignments).forEach(([key, value]) => {
          const old = server.assignments[key] || { answered: [], complete: false };
          server.assignments[key] = {
            answered: [...new Set(old.answered.concat(value.answered))],
            complete: old.complete || value.complete,
            updatedAt: new Date().toISOString()
          };
        });
        return Promise.resolve(JSON.parse(JSON.stringify(server)));
      }
    }
  };
  window.window = window;
  vm.createContext(window);
  vm.runInContext(fs.readFileSync('scripts/forge-revision-progress.js', 'utf8'), window);
  return { progress: window.ForgeRevisionProgress, setOffline(value) { offline = value; } };
}

(async () => {
  const phone = device(), computer = device();
  const first = { lastRating: 'got-it', dueAt: '2026-10-08T00:00:00Z', secureReviews: 1, updatedAt: '2026-09-30T10:00:00Z' };
  await phone.progress.save(student, 'ECON-1.1|Q1', first, assignmentId, { answered: ['ECON-1.1|Q1'], complete: false });
  const onComputer = await computer.progress.load(student, { reviews: {}, assignments: {} });
  assert.strictEqual(onComputer.reviews['ECON-1.1|Q1'].dueAt, first.dueAt);
  assert.deepStrictEqual(onComputer.assignments[assignmentId].answered, ['ECON-1.1|Q1']);

  await computer.progress.save(student, 'ECON-1.1|Q2', first, assignmentId, { answered: ['ECON-1.1|Q2'], complete: true });
  phone.setOffline(true);
  const offlineReview = { lastRating: 'nearly', dueAt: '2026-10-02T00:00:00Z', secureReviews: 0, updatedAt: '2026-09-30T11:00:00Z' };
  await assert.rejects(phone.progress.save(student, 'ECON-1.1|Q3', offlineReview, null, null), /offline/);
  phone.setOffline(false);
  const recovered = await phone.progress.load(student, {
    reviews: { 'ECON-1.1|Q1': first, 'ECON-1.1|Q3': offlineReview, 'personal|own': first },
    assignments: { [assignmentId]: { answered: ['ECON-1.1|Q1'], complete: false } }
  });
  assert.strictEqual(recovered.reviews['ECON-1.1|Q3'].lastRating, 'nearly');
  assert.strictEqual(recovered.reviews['personal|own'], undefined);
  assert.strictEqual(recovered.assignments[assignmentId].complete, true);
  assert.deepStrictEqual(new Set(recovered.assignments[assignmentId].answered), new Set(['ECON-1.1|Q1', 'ECON-1.1|Q2']));

  const newer = { lastRating: 'again', dueAt: '2026-10-01T00:00:00Z', secureReviews: 0, updatedAt: '2026-09-30T12:00:00Z' };
  await computer.progress.save(student, 'ECON-1.1|Q1', newer, null, null);
  const afterStaleUpload = await phone.progress.load(student, { reviews: { 'ECON-1.1|Q1': first }, assignments: { 'deleted-assignment': { answered: ['ECON-1.1|Q4'], complete: false } } }, [assignmentId]);
  assert.strictEqual(afterStaleUpload.reviews['ECON-1.1|Q1'].lastRating, 'again');
  assert.strictEqual(server.assignments['deleted-assignment'], undefined);
  const merged = phone.progress.merge({ reviews: { 'personal|own': first }, assignments: {} }, afterStaleUpload);
  assert(merged.reviews['personal|own'], 'personal-card reviews remain separate');
  console.log('Revision progress sync tests passed (two devices, offline replay, stale review, assignment union).');
})().catch(error => { console.error(error); process.exitCode = 1; });
