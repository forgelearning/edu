#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const storage = new Map();
const serverCards = new Map();
let offline = true;
let badAck = false;
let lastRequest;
const window = {
  Promise, JSON, String, Date,
  localStorage: {
    getItem(key) { return storage.get(key) || null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  ForgeAPI: {
    config: { key: 'public-key' },
    rpc(name, body, options) {
      lastRequest = { name, body, options };
      if (offline) return Promise.reject(new Error('offline'));
      if (badAck && body.p_action === 'save') return Promise.resolve([]);
      if (body.p_action === 'save') serverCards.set(body.p_card.id, { ...body.p_card, review: body.p_review });
      if (body.p_action === 'delete') serverCards.delete(body.p_card.id);
      if (body.p_action === 'list') return Promise.resolve([...serverCards.values()]);
      return Promise.resolve({ ok: true });
    }
  }
};
window.window = window;
vm.createContext(window);
vm.runInContext(fs.readFileSync('scripts/forge-personal-cards.js', 'utf8'), window);
function anotherDevice() {
  const ownStorage = new Map();
  const device = {
    Promise, JSON, String, Date, ForgeAPI: window.ForgeAPI,
    localStorage: {
      getItem(key) { return ownStorage.get(key) || null; },
      setItem(key, value) { ownStorage.set(key, String(value)); }
    }
  };
  device.window = device;
  vm.createContext(device);
  vm.runInContext(fs.readFileSync('scripts/forge-personal-cards.js', 'utf8'), device);
  return device;
}

(async () => {
  const context = { studentId: 'student-1', classCode: 'CLASS', studentCode: 'ABC12345' };
  const card = { id: 'c-1', front: 'Question?', back: 'Answer.', bank: 'GCSE-GEO-HAZ' };
  await assert.rejects(window.ForgePersonalCards.save(context, card), /offline/);
  assert.strictEqual(JSON.parse(storage.get('forge-personal-pending:student-1')).length, 1);
  offline = false;
  const loaded = await window.ForgePersonalCards.load(context);
  assert.strictEqual(loaded.length, 1);
  assert.strictEqual(loaded[0].front, 'Question?');
  assert.strictEqual(lastRequest.body.p_student_code, 'ABC12345');
  assert.strictEqual(JSON.parse(storage.get('forge-personal-pending:student-1')).length, 0);
  await window.ForgePersonalCards.remove(context, 'c-1');
  assert.strictEqual((await window.ForgePersonalCards.load(context)).length, 0);
  assert.strictEqual(window.ForgePersonalCards.canSync({ studentId: 'free' }), false);
  const free = { studentId: 'free-student', freeToken: 'free-123456789012' };
  assert.strictEqual(window.ForgePersonalCards.canSync(free), true);
  await window.ForgePersonalCards.save(free, card);
  assert.strictEqual(lastRequest.body.p_free_token, free.freeToken);

  badAck = true;
  const unconfirmed = { id: 'c-unconfirmed', front: 'Still here?', back: 'On this device.', bank: 'GCSE-GEO-HAZ' };
  await assert.rejects(window.ForgePersonalCards.save(free, unconfirmed), /not confirmed/);
  assert.strictEqual(JSON.parse(storage.get('forge-personal-pending:free-student')).length, 1, 'an unconfirmed save stays queued');
  badAck = false;
  assert((await window.ForgePersonalCards.load(free)).some(item => item.id === unconfirmed.id));

  const oldDevice = anotherDevice();
  const legacy = { id: 'c-legacy', front: 'Before sync?', back: 'Saved locally.', bank: 'GCSE-GEO-HAZ' };
  const legacyReview = { lastRating: 'got-it', dueAt: '2026-10-08T00:00:00.000Z', secureReviews: 1, updatedAt: '2026-09-30T00:00:00.000Z' };
  const imported = await oldDevice.ForgePersonalCards.load(context, [legacy], { 'personal|c-legacy': legacyReview });
  assert(imported.some(item => item.id === legacy.id));
  const newDevice = anotherDevice();
  const synced = await newDevice.ForgePersonalCards.load(context, [], {});
  assert.strictEqual(synced.find(item => item.id === legacy.id).review.dueAt, legacyReview.dueAt);

  const quizSource = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
  const offer = quizSource.match(/function offerRevisionCard\(feedback, question\)\{[\s\S]*?\n\}\n\nfunction renderQuiz/);
  assert(offer, 'quiz offers card creation after feedback');
  let addedButton;
  let savedResumeIndex;
  const quiz = {
    JSON, URLSearchParams,
    state: { studentId: 'student-1', bank: 'GCSE-GEO-HAZ', subject: 'gcse-geo', idx: 2, classId: 'class-1', assignmentId: 'assignment-1' },
    localStorage: window.localStorage,
    document: { createElement() { return {}; } },
    location: { href: '', search: '' },
    forgeSaveSession() { savedResumeIndex = quiz.state.cardReturnResumeAt; }
  };
  vm.createContext(quiz);
  vm.runInContext(offer[0].replace(/\n\nfunction renderQuiz$/, ''), quiz);
  quiz.offerRevisionCard({ appendChild(button) { addedButton = button; } }, {
    id: 'Q-1', stem: 'What happens at a destructive boundary?',
    options: { A: 'One plate subducts.' }, correct: 'A'
  });
  assert.strictEqual(addedButton.textContent, 'Make a flashcard from this');
  addedButton.onclick();
  assert.strictEqual(quiz.location.href, 'revision.html');
  const draft = JSON.parse(storage.get('forge-revision-draft:student-1'));
  assert.strictEqual(draft.back, 'One plate subducts.');
  assert.strictEqual(draft.returnTo, 'forge-quiz.html?bank=GCSE-GEO-HAZ&subject=gcse-geo&class_id=class-1&assignment_id=assignment-1');
  assert.strictEqual(savedResumeIndex, 3);
  console.log('Personal card sync tests passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
