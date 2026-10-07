const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const window={};window.window=window;
vm.createContext(window);
vm.runInContext(fs.readFileSync('scripts/forge-ranks.js','utf8'),window);
const R=window.ForgeRanks;

// Thresholds are the ones the profile always used, so no student's rank moves.
assert.deepStrictEqual(JSON.parse(JSON.stringify(R.RANKS.map(r=>[r.name,r.min,r.frame]))),[
  ['Apprentice',0,'iron'],['Journeyman',300,'bronze'],['Craftsman',1500,'silver'],['Forged',5000,'gold'],['Master',15000,'ember']]);
assert.strictEqual(R.rankFor(299).name,'Apprentice');
assert.strictEqual(R.rankFor(300).name,'Journeyman');
assert.strictEqual(R.rankFor(15000).name,'Master');
assert.strictEqual(R.rankFor(-5).name,'Apprentice');
assert.strictEqual(R.rankFor('nonsense').name,'Apprentice');
assert.deepStrictEqual(JSON.parse(JSON.stringify(R.progress(900))),JSON.parse(JSON.stringify({rank:R.RANKS[1],next:R.RANKS[2],pct:50,toNext:600})));
assert.strictEqual(R.progress(20000).next,null);
assert.strictEqual(R.progress(20000).pct,100);

assert.strictEqual(R.initials('Amira K.'),'AK');
assert.strictEqual(R.initials('jo'),'J');
assert.strictEqual(R.initials('  '),'?');
assert.strictEqual(R.initials('Élodie van der Berg'),'ÉB');

// Names come from other students, so everything rendered is escaped.
const html=R.avatarHtml('<img src=x onerror=alert(1)>',400,{label:true})+R.chipHtml(400)+R.ladderHtml('"><b>',400);
assert(!/<img|<b>/.test(html),'avatar, chip and ladder escape names');
assert(html.includes('forge-frame--bronze'));
assert(R.avatarHtml('Sam',0).includes('aria-hidden="true"'),'avatar beside a printed name is decorative');

const ladder=R.ladderHtml('Sam',1600);
assert.strictEqual((ladder.match(/forge-rank-ladder__step[^"]*is-locked/g)||[]).length,2,'Forged and Master still locked at 1,600 XP');
assert.strictEqual((ladder.match(/is-current/g)||[]).length,1);
assert(ladder.includes('3,400 XP to go'));
console.log('Rank and frame tests passed.');
