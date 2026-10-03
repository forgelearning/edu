#!/usr/bin/env node
'use strict';
// Exercise the shared shell's state and event dispatch without a live account.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
function harness(saved) {
  const nodes = new Map(), events = {}, values = new Map();
  if (saved !== undefined) values.set('forge-sidebar-expanded',saved);
  function node() {
    const classes=new Set(), attrs={};
    return {style:{}, textContent:'', innerHTML:'',
      classList:{add(...v){v.forEach(x=>classes.add(x));},remove(...v){v.forEach(x=>classes.delete(x));},contains(v){return classes.has(v);},toggle(v,on){if(on===undefined)on=!classes.has(v);on?classes.add(v):classes.delete(v);return on;}},
      setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k]||null;},removeAttribute(k){delete attrs[k];},
      insertAdjacentHTML(){},querySelector(){return null;},focus(){},contains(){return false;}};
  }
  const doc={body:node(),documentElement:node(),head:{appendChild(){}},
    getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},
    querySelector(s){return s.startsWith('meta')||s.startsWith('link')||s.startsWith('script')?node():null;},
    querySelectorAll(){return [];},createElement:node,addEventListener(k,f){events[k]=f;}};
  class Element {closest(selector){return selector==='[data-forge-sidebar-action]'?this:null;}}
  const ctx={document:doc,Element,console,localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},location:{href:''}};
  ctx.window=ctx; vm.createContext(ctx);vm.runInContext(fs.readFileSync('scripts/forge-sidebar.js','utf8'),ctx);
  ctx.ForgeSidebar.mount({active:'forge',items:[{key:'dashboard',href:'student-dashboard.html',label:'Dashboard'},{key:'forge',href:'forge-quiz.html',label:'Forge'},{key:'assignments',href:'assignments.html',label:'Assigned'},{key:'anvil',href:'anvil.html',label:'Anvil'},{key:'crucible',href:'crucible.html',label:'Crucible'}],footerItems:[{key:'profile',href:'profile.html',label:'Profile'}]});
  return {ctx,doc,events,Element,values};
}
const h=harness();
assert.equal(h.doc.getElementById('forge-sidebar-toggle').getAttribute('aria-expanded'),'true','first-time students see labelled navigation');
h.ctx.ForgeSidebar._toggleSidebar();
assert.equal(h.doc.getElementById('forge-sidebar-toggle-label').textContent,'Menu');
assert.equal(h.values.get('forge-sidebar-expanded'),'0');
assert.equal(harness('0').doc.getElementById('forge-sidebar-toggle').getAttribute('aria-expanded'),'false','explicit preference survives navigation');
const config=h.ctx.ForgeSidebar._config;
const mobile=Array.from(h.ctx._fsMobileItems(config),x=>x.key);
assert.deepEqual(mobile.slice(0,4),['dashboard','forge','anvil','assignments']);
assert.equal(new Set(mobile).size,config.items.length,'every destination remains available');
const tabs=h.ctx.ForgeSidebar._tabbarHtml({...config,active:'revision'});
assert(tabs.includes('class="ftab active" data-key="__more"'),'overflow destinations highlight Menu');
assert(h.ctx._fsItemHtml({key:'forge',href:'forge-quiz.html',label:'Practice'},'forge').includes('aria-current="page"'));
const action=new h.Element();
action.getAttribute=k=>({'data-forge-sidebar-action':'navigate','data-forge-sidebar-href':'revision.html'})[k];
h.events.click({target:action,preventDefault(){}});
assert.equal(h.ctx.location.href,'revision.html','delegated menu clicks receive their destination');
const question={window:{}};vm.createContext(question);vm.runInContext(fs.readFileSync('scripts/forge-question.js','utf8'),question);
const feedback=question.window.ForgeQuestion.renderFeedback({scaffold:'Explanation',reforge:{}},false);
assert(feedback.includes('Try a similar question')&&feedback.includes('id="next-btn"'),'repair and continuation both remain available');
assert(feedback.includes('Not quite. Here’s the key idea.')&&feedback.includes('Continue without repair'),'wrong-answer feedback names the result and makes the skip explicit');
assert(question.window.ForgeQuestion.renderFeedback({},true).includes('Correct.'),'correct-answer feedback gives a clear result');
console.log('Student navigation tests passed (defaults, persistence, mobile destinations, active state, menu routing and repair feedback).');
const dashboardSource=fs.readFileSync('pages/app/student-dashboard.html','utf8');
const render=dashboardSource.slice(dashboardSource.indexOf('function daysUntil('),dashboardSource.indexOf('function forgeSignOut()'));
const section={innerHTML:'',classList:{toggle(){}}};
const focusValues=new Map();
const d={document:{querySelector:()=>section,getElementById:()=>null},st:{studentId:'student-1',studentName:'Alex <preview>',responses:[]},app:{},BANKS:{growth:{label:'Economic growth'}},SUBJECTS:{econ:{label:'Economics',banks:['growth']},geo:{label:'Geography',banks:['hazards']}},RANKS:[{name:'Apprentice',min:0},{name:'Journeyman',min:300}],calcXP:()=>120,calcStreak:()=>0,_fsEsc:h.ctx._fsEsc,localStorage:{getItem:k=>focusValues.get(k)||null,setItem:(k,v)=>focusValues.set(k,v)},ForgeMisconceptions:{summarize:()=>({active:[]})},ForgeApp:{stateHtml:(kind,options)=>options.label},location:{href:'student-dashboard.html'}};
d.window=d;
d.getRank=xp=>d.RANKS.slice().reverse().find(rank=>xp>=rank.min);
vm.createContext(d);vm.runInContext(fs.readFileSync('scripts/forge-student-focus.js','utf8'),d);vm.runInContext(render,d);d.renderDashboard();
assert(d.app.innerHTML.includes('Start your first practice'));
assert(d.app.innerHTML.includes('Alex &lt;preview&gt;'),'student names remain text');
d.st.responses=Array.from({length:4},()=>({bank:'growth',is_correct:true}));d.renderDashboard();
assert(d.app.innerHTML.includes('Practise Economic growth'),'recommendations use readable topic names');
assert.equal((d.app.innerHTML.match(/forge-button--primary/g)||[]).length,1,'one primary recommendation');
assert(d.app.innerHTML.includes('180 XP to Journeyman')&&d.app.innerHTML.includes('aria-valuenow="120"'),'rank progress shows the next attainable milestone');
const yesterday=new Date(Date.now()-86400000).toISOString(),tomorrow=new Date(Date.now()+86400000).toISOString();
focusValues.set('forge-revision:student-1',JSON.stringify({reviews:{'growth|q1':{dueAt:yesterday},'growth|q2':{dueAt:tomorrow},'hazards|q3':{dueAt:yesterday},'personal|missing':{dueAt:yesterday}}}));
d.renderDashboard();
assert(d.app.innerHTML.includes('Bring 1 card back to mind')&&d.app.innerHTML.includes('revision.html?subject=econ'),'due revision beats general topic practice and opens the right subject');
assert(d.app.innerHTML.includes('dashboard-return-cue')&&d.app.innerHTML.includes('1 idea ready to strengthen'),'due cards also get a compact direct return cue');
d.ForgeStudentFocus.remember('student-1','geo');
assert.equal(d.ForgeStudentFocus.subject(d.st,[]),'geo','individual subject choice survives a page change');
focusValues.set('forge-student',JSON.stringify({studentId:'student-1',classSubject:'econ'}));
assert.equal(d.ForgeStudentFocus.subject(d.st,[]),'econ','class subject wins for class students');
focusValues.delete('forge-student');focusValues.delete('forge-revision:student-1');
d.ForgeMisconceptions.summarize=()=>({active:[{tag:'test'}]});d.renderDashboard();
assert(d.app.innerHTML.includes('Repair mistakes →'));
d.st.responses=[];d.st.loadError=true;d.renderDashboard();
assert(d.app.innerHTML.includes('Your dashboard data is unavailable')&&!d.app.innerHTML.includes('Start your first practice'),'failed loading is not an empty history');
const ymd=n=>{const t=new Date();t.setDate(t.getDate()+n);return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;};
d.showAssignmentNext([{title:'Later <work>',due_date:ymd(20)}]);
assert.equal(section.innerHTML,'','work due in three weeks does not displace practice');
d.showAssignmentNext([{title:'Later',due_date:ymd(5)},{title:'Late <one>',due_date:ymd(-2)},{title:'Undated'}]);
assert(section.innerHTML.includes('Late &lt;one&gt;')&&section.innerHTML.includes('Overdue by 2 days')&&section.innerHTML.includes('2 other open assignments')&&section.innerHTML.includes('Catch up now'),'the most overdue assignment leads and titles are escaped');
d.showAssignmentNext([{title:'Undated'},{title:'Soon',due_date:ymd(1)}]);
assert(section.innerHTML.includes('Soon')&&section.innerHTML.includes('Due tomorrow'),'a dated assignment outranks an undated one');
d.showAssignmentNext([{title:'Undated only'}]);
assert(section.innerHTML.includes('No due date')&&section.innerHTML.includes('Start assignment'),'undated open work is still surfaced');
d.showAssignmentNext([{title:'Half done',due_date:ymd(3),dashProgress:{answered:3,total:8}}]);
assert(section.innerHTML.includes('3 of 8 questions answered')&&section.innerHTML.includes('Continue assignment'),'partial progress is shown and the action says continue');
console.log('Dashboard journeys passed (new student, topic recommendation, repair, escaped name and loading failure).');
