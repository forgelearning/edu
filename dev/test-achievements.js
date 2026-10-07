const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const ctx={};ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-streak.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('scripts/forge-achievements.js','utf8'),ctx);
const A=ctx.ForgeAchievements;
const plain=v=>JSON.parse(JSON.stringify(v));
const day=n=>new Date(2026,8,1+n,12).toISOString();
let seq=0;
const ans=(o={})=>Object.assign({question_id:'Q-'+(seq++),bank:'b1',is_correct:true,hint_used:false,reforge_attempted:false,reforge_correct:null,created_at:day(0)},o);

// Nothing earned on an empty history; the section says so.
const empty=A.compute([]);
assert(empty.every(b=>b.tier===null));
assert(A.html(empty).includes('0 of 7 earned'));
assert.strictEqual((A.html(empty).match(/is-locked/g)||[]).length,7);

// Only first attempts count as answers; Reforge, repair-mode and timed do not.
const mixed=[ans(),ans(),ans({reforge_attempted:true,reforge_correct:true}),ans({question_id:'X-ANVIL'}),ans({question_id:'X-CRU'}),ans({question_id:'Y-CRU',is_correct:false})];
const m=plain(A.measure(mixed));
assert.strictEqual(m.answers,2);
assert.strictEqual(m.repairs,2,'a correct Reforge and a correct repair-mode answer');
assert.strictEqual(m.timed,1,'only correct timed answers');

// Longest streak uses the one-day freeze, and is kept after the streak breaks.
const days=[0,1,3,4, 10,11].map(d=>ans({created_at:day(d)}));
assert.strictEqual(A.measure(days).streak,4,'days 0,1,(miss),3,4 is a run of four practice days');
assert.strictEqual(A.measure([0,3].map(d=>ans({created_at:day(d)}))).streak,1,'two missed days break the run');

// Topics explored needs five first attempts in a topic.
const topics=[...Array(5)].map(()=>ans({bank:'t1'})).concat([...Array(4)].map(()=>ans({bank:'t2'})));
assert.strictEqual(A.measure(topics).topics,1);

// Sharpened: 8 of 10 consecutive first attempts right without a hint, at any
// point -- so later wrong answers do not take it away.
const sharp=[...Array(10)].map((_,i)=>ans({bank:'s1',is_correct:i>=2,created_at:day(i)}))
  .concat([...Array(10)].map((_,i)=>ans({bank:'s1',is_correct:false,created_at:day(20+i)})));
assert.strictEqual(A.measure(sharp).sharpened,1);
const hinted=[...Array(10)].map((_,i)=>ans({bank:'s2',hint_used:i<3,created_at:day(i)}));
assert.strictEqual(A.measure(hinted).sharpened,0,'hinted correct answers are not credited');

// Tiers: Questions answered is 10 / 100 / 500.
const answers=n=>A.compute([...Array(n)].map(()=>ans())).find(b=>b.key==='answers');
assert.strictEqual(answers(9).tier,null);
assert.strictEqual(answers(10).tier.name,'Bronze');
assert.strictEqual(answers(10).next.goal,100);
assert.strictEqual(answers(500).tier.name,'Gold');
assert.strictEqual(answers(500).next,null);
assert(A.html(A.compute([...Array(500)].map(()=>ans()))).includes('every tier earned'));

// Misconceptions cleared comes from the profile's own count.
assert.strictEqual(A.compute([],{resolved:12}).find(b=>b.key==='cleared').tier.name,'Silver');
// Gold streak is 21 days: a long run is hard to keep across a half-term.
const streakDays=n=>[...Array(n)].map((_,i)=>ans({created_at:day(i)}));
assert.strictEqual(A.compute(streakDays(20)).find(b=>b.key==='streak').tier.name,'Silver');
assert.strictEqual(A.compute(streakDays(21)).find(b=>b.key==='streak').tier.name,'Gold');

// Topic badges scale with the subject's topic list: a quarter, half and all
// for explored; one, half and all for sharpened.
assert.deepStrictEqual(plain(A.tiersFor(A.BADGES.find(b=>b.key==='topics'),3)),[1,2,3],'A-level Chemistry: 3 topics');
assert.deepStrictEqual(plain(A.tiersFor(A.BADGES.find(b=>b.key==='topics'),22)),[6,11,22],'GCSE Economics: 22 topics');
assert.deepStrictEqual(plain(A.tiersFor(A.BADGES.find(b=>b.key==='sharpened'),3)),[1,2,3]);
assert.deepStrictEqual(plain(A.tiersFor(A.BADGES.find(b=>b.key==='sharpened'),22)),[1,11,22]);
assert.deepStrictEqual(plain(A.tiersFor(A.BADGES.find(b=>b.key==='topics'),0)),[3,10,25],'no topic list: fixed fallback');
const five=bank=>[...Array(5)].map(()=>ans({bank}));
const chem=['c1','c2','c3'];
const explored=(rows,banks)=>A.compute(rows,{topicBanks:banks}).find(b=>b.key==='topics');
assert.strictEqual(explored(five('c1').concat(five('c2'),five('c3')),chem).tier.name,'Gold','every topic of a three-topic course is Gold');
assert.strictEqual(explored(five('c1').concat(five('other1'),five('other2')),chem).tier.name,'Bronze','topics outside the subject do not count');
assert.strictEqual(explored(five('c1'),chem).next.goal,2);
const sharpIn=bank=>[...Array(10)].map((_,i)=>ans({bank,created_at:day(i)}));
assert.strictEqual(A.compute(sharpIn('c1').concat(sharpIn('c2'),sharpIn('c3')),{topicBanks:chem}).find(b=>b.key==='sharpened').tier.name,'Gold');
assert.strictEqual(A.compute(sharpIn('zz'),{topicBanks:chem}).find(b=>b.key==='sharpened').tier,null,'sharpening another subject does not count');
console.log('Achievement badge tests passed.');
