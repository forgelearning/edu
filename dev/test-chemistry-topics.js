#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const page = {window:null};
page.window = page;
page.ForgeData = {register(subject,banks){
  for(const [id,bank] of Object.entries(banks)) page.BANKS[id] = {...page.BANKS[id],...bank};
}};
vm.createContext(page);
for(const file of ['data/spec-registry.js','data/forge-catalog.js','scripts/forge-chemistry-topics.js','data/question-payloads/chem.js','scripts/forge-chemistry-resources.js']) {
  vm.runInContext(fs.readFileSync(file,'utf8'),page,{filename:file});
}
const topics = page.ForgeChemistryTopics.list();
assert(topics.length > 25);
assert.strictEqual(topics.reduce((total,topic)=>total+topic.count,0),364);
assert(topics.every(topic=>topic.count>=10),"every Chemistry topic has at least ten revision cards");
for(const topic of topics) {
  const items = page.ForgeChemistryTopics.questions(topic.id);
  assert.strictEqual(items.length,topic.count,topic.label);
  assert(items.every(item=>item.question.specPointId===topic.pointId));
  assert(items.every(item=>page.SUBJECTS.chem.banks.includes(item.bank)));
  assert(items.every(item=>page.ForgeChemistryResources.forQuestion(item.question).some(resource=>resource.kind==='notes')),topic.label+' needs notes');
}
const massSpec=page.ForgeChemistryResources.forQuestion({specPointId:'aqa-a-chem-3.1.1',stem:'How does TOF mass spectrometry work?'});
assert(massSpec.some(resource=>resource.kind==='video'&&resource.url.includes('WoNzJUu3gKA')));
assert(massSpec.some(resource=>resource.kind==='notes'&&resource.url.includes('masspecmenu.html')));
assert(!page.ForgeChemistryResources.forQuestion({specPointId:'aqa-a-chem-3.1.1',stem:'What are isotopes?'}).some(resource=>resource.kind==='video'));
assert(page.ForgeChemistryResources.forQuestion({specPointId:'aqa-a-chem-3.1.3',stem:'Explain hydrogen bonding'}).some(resource=>resource.kind==='video'));
assert.strictEqual(page.ForgeChemistryResources.forQuestion({specPointId:'aqa-a-bio-3.1.1',stem:'Atomic structure'}).length,0);
const quizHtml=fs.readFileSync('pages/app/forge-quiz.html','utf8');
assert(quizHtml.includes('scripts/forge-chemistry-resources.js'));
assert(quizHtml.includes('ForgeChemistryResources.appendTo(fb,q)'));
// The help panel is added to wrong-answer feedback before the quiz wires up
// its buttons, so a throw here leaves "Try a similar question" and "Continue"
// dead. The buttons sit inside .forge-feedback-actions, not directly in the
// feedback box, and insertBefore throws on a reference node that is not a
// direct child — enforce that rule in the fake DOM.
{
  const el = (cls, parent) => ({className:cls, parentNode:parent||null, children:[], appendChild(child){child.parentNode=this;this.children.push(child);return child;}, setAttribute(){}});
  const feedback = el('feedback');
  feedback.appendChild(el('scaffold-box'));
  const actions = feedback.appendChild(el('forge-feedback-actions'));
  const rfBtn = actions.appendChild(el('reforge-trigger'));
  feedback.querySelector = selector => selector === '.forge-feedback-actions' ? actions : selector.includes('#rf-btn') ? rfBtn : null;
  feedback.insertBefore = function(node, ref){
    if (ref && ref.parentNode !== this) throw new Error('NotFoundError: reference node is not a child');
    const at = ref ? this.children.indexOf(ref) : this.children.length;
    node.parentNode = this; this.children.splice(at, 0, node); return node;
  };
  const domPage = {document:{createElement:tag => el(tag)}};
  domPage.window = domPage;
  vm.createContext(domPage);
  vm.runInContext(fs.readFileSync('scripts/forge-chemistry-resources.js','utf8'), domPage);
  domPage.ForgeChemistryResources.appendTo(feedback, {specPointId:'aqa-a-chem-3.1.1', stem:'What is the first ionisation energy?'});
  assert.strictEqual(feedback.children.length, 3);
  assert.strictEqual(feedback.children[1].className, 'forge-chemistry-help', 'help panel sits above the action buttons');
  assert.strictEqual(feedback.children[2], actions);
}
const atomic=topics.find(topic=>topic.code==='3.1.1');
assert.strictEqual(atomic.label,'Atomic structure');
assert.strictEqual(atomic.count,16);
assert(!page.ForgeChemistryTopics.questions(atomic.id).some(item=>item.question.id==='CHEM-N1-12'));
assert(page.ForgeChemistryTopics.questions(topics.find(topic=>topic.code==='3.1.3').id).some(item=>item.question.id==='CHEM-N1-12'));
assert(page.ForgeChemistryTopics.sourceBanks(atomic.id).length>1);
assert.deepStrictEqual(Array.from(page.ForgeChemistryTopics.sourceBanks('CHEM-1')),['CHEM-1']);
const saved={};
page.localStorage={getItem(key){return saved[key]||null;},setItem(key,value){saved[key]=value;}};
page.setTimeout=function(){};
vm.runInContext(fs.readFileSync('scripts/forge-revision.js','utf8'),page,{filename:'scripts/forge-revision.js'});
const panel=page.ForgeRevision.teacherPanelHtml('chem');
assert(panel.includes('Atomic structure'));
assert(panel.includes('Amines'));
assert(!panel.includes('value="'+atomic.id+'" checked'));
const listeners={};
const title={textContent:''};
const app={innerHTML:'',querySelector(selector){return selector==='.revision-today h2'?title:null;},addEventListener(name,handler){listeners[name]=handler;}};
page.ForgeRevision.mountStudent({root:app,context:{studentId:'chem-test'},subject:'chem',assignments:[]});
assert.strictEqual(title.textContent,'Choose a Chemistry topic to practise.');
assert(!app.innerHTML.includes('data-revision-action="today"'));
assert(app.innerHTML.includes('data-bank="'+atomic.id+'"'));
listeners.click({target:{closest(selector){return selector==='[data-revision-action]'?{getAttribute(name){return name==='data-revision-action'?'topic':atomic.id;}}:null;}}});
assert(app.innerHTML.includes('Card 1 of 8'));
const escaped = value => String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
assert(atomic && page.ForgeChemistryTopics.questions(atomic.id).some(item=>app.innerHTML.includes(escaped(item.question.stem))));
// A-Level Physics uses the same mapping, at the AQA section level. Every
// question must land in exactly one topic, and topic ids must not collide with
// chemistry's.
vm.runInContext(fs.readFileSync('data/question-payloads/phys.js','utf8'),page,{filename:'data/question-payloads/phys.js'});
const physTopics=page.ForgeChemistryTopics.list('phys');
assert(page.ForgeChemistryTopics.has('phys'));
assert(!page.ForgeChemistryTopics.has('bio'));
assert.strictEqual(physTopics.reduce((total,topic)=>total+topic.count,0),page.SUBJECTS.phys.banks.reduce((total,bank)=>total+page.BANKS[bank].questions.length,0));
assert.strictEqual(physTopics.map(topic=>topic.code).slice(0,3).join(','),'3.1,3.2,3.3');
assert.strictEqual(physTopics.find(topic=>topic.code==='3.10').heading,null,'3.10 sorts after 3.9, not after 3.1');
for(const topic of physTopics){
  assert(topic.id.startsWith('phys-topic:'));
  const items=page.ForgeChemistryTopics.questions(topic.id);
  assert.strictEqual(items.length,topic.count,topic.label);
  assert(items.every(item=>page.SUBJECTS.phys.banks.includes(item.bank)));
  assert.strictEqual(page.ForgeChemistryTopics.label(topic.id),topic.label);
}
assert(quizHtml.includes('ForgeChemistryTopics.has(state.subject)'));
// Every Physics question needs a hand-assigned section in data/forge-data.js;
// otherwise it silently falls back to its paper's default topic.
{
  const source=fs.readFileSync('data/forge-data.js','utf8');
  const block=source.slice(source.indexOf('const physicsSectionQuestions = {'),source.indexOf('const physicsSectionFor = {};'));
  const assigned=new Set(block.match(/"[A-Z0-9-]+"(?=[,\n\s]*[\],])/g).map(id=>id.slice(1,-1)));
  const missing=page.SUBJECTS.phys.banks.flatMap(bank=>page.BANKS[bank].questions.map(question=>question.id)).filter(id=>!assigned.has(id));
  assert.strictEqual(missing.join(', '),'','Physics questions without a section in physicsSectionQuestions');
}
// Revision: the teacher panel and the student's topic list offer Physics by
// AQA section, a set of cards stays inside the chosen section, and a set
// revision counts its topic's questions rather than 0.
{
  const mechanics=physTopics.find(topic=>topic.code==='3.4');
  const physPanel=page.ForgeRevision.teacherPanelHtml('phys');
  assert(physPanel.includes('value="'+mechanics.id+'"'));
  assert(physPanel.includes('Mechanics and materials'));
  assert(!physPanel.includes('value="PHYS-1"'),'teacher picks Physics topics, not papers');
  assert(!/value="phys-topic:[^"]*" checked/.test(physPanel),'no topic pre-selected');
  assert.strictEqual(page.ForgeRevision.assignmentProgress({id:'p1',banks:[mechanics.id,page.ForgeRevision.markerFor(500)]},page.ForgeRevision.readState({studentId:'phys-test'})).total,mechanics.count);
  const physListeners={};
  const physApp={innerHTML:'',querySelector(selector){return selector==='.revision-today h2'?{textContent:''}:null;},addEventListener(name,handler){physListeners[name]=handler;}};
  page.ForgeRevision.mountStudent({root:physApp,context:{studentId:'phys-test'},subject:'phys',assignments:[]});
  assert(physApp.innerHTML.includes('data-bank="'+mechanics.id+'"'));
  assert(physApp.innerHTML.includes('>Core content</h3>')&&physApp.innerHTML.includes('>Optional topics</h3>'));
  assert(physApp.innerHTML.includes('data-revision-action="today"'),'Physics keeps its mixed Today set');
  physListeners.click({target:{closest(selector){return selector==='[data-revision-action]'?{getAttribute(name){return name==='data-revision-action'?'topic':mechanics.id;}}:null;}}});
  const mechanicsStems=page.ForgeChemistryTopics.questions(mechanics.id).map(item=>escaped(item.question.stem));
  const otherStems=physTopics.filter(topic=>topic!==mechanics).flatMap(topic=>page.ForgeChemistryTopics.questions(topic.id)).map(item=>escaped(item.question.stem)).filter(stem=>!mechanicsStems.includes(stem));
  assert(mechanicsStems.some(stem=>physApp.innerHTML.includes(stem)));
  assert(!otherStems.some(stem=>physApp.innerHTML.includes(stem)),'a Mechanics set shows only Mechanics cards');
}
// Psychology's Approaches splits into parts by tag. Every question must land
// in exactly one part (an untagged new question would silently vanish from
// them), each part needs enough questions for a session, and a part keeps
// the real bank id so responses still record against PSY-APP.
{
  vm.runInContext(fs.readFileSync('data/question-payloads/psych.js','utf8'),page,{filename:'data/question-payloads/psych.js'});
  assert(!page.ForgeChemistryTopics.has('psych'),'Psychology keeps its topic cards');
  assert.strictEqual(page.ForgeChemistryTopics.parts('PSY-SI').length,0);
  const parts=page.ForgeChemistryTopics.parts('PSY-APP');
  assert.strictEqual(parts.length,8);
  const app=page.BANKS['PSY-APP'].questions;
  const seen=new Map();
  for(const part of parts){
    assert(part.count>=8,part.label+' has only '+part.count+' questions');
    const items=page.ForgeChemistryTopics.questions(part.id);
    assert.strictEqual(items.length,part.count,part.label);
    assert(items.every(item=>item.bank==='PSY-APP'));
    assert.deepStrictEqual(Array.from(page.ForgeChemistryTopics.sourceBanks(part.id)),['PSY-APP']);
    assert.strictEqual(page.ForgeChemistryTopics.label(part.id),part.label);
    assert.strictEqual(page.ForgeChemistryTopics.find(part.id).count,part.count);
    assert(page.ForgeChemistryTopics.pointId(part.id),'revision treats a part as a topic');
    for(const item of items)seen.set(item.question.id,(seen.get(item.question.id)||0)+1);
  }
  const unplaced=app.filter(question=>seen.get(question.id)!==1).map(question=>question.id);
  assert.strictEqual(unplaced.join(', '),'','Approaches questions not in exactly one part');
  assert.strictEqual(page.ForgeChemistryTopics.questions('part:PSY-APP:nope').length,0);
  assert(quizHtml.includes('topicPartsHtml(key)'));
}
console.log('Chemistry topic mapping passed (364 questions, original bank identities preserved).');
