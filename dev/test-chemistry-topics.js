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
assert.strictEqual(topics.reduce((total,topic)=>total+topic.count,0),202);
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
console.log('Chemistry topic mapping passed (202 questions, original bank identities preserved).');
