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
// The league computes rank keys in SQL. Its thresholds must match RANKS, or a
// classmate's frame in the league would disagree with the friends list.
const migrations=fs.readdirSync('supabase/migrations').filter(f=>/^\d+_.*\.sql$/.test(f)).sort();
const latestLeague=migrations.filter(f=>fs.readFileSync('supabase/migrations/'+f,'utf8').includes('function public.get_class_weekly_league')).pop();
const sql=fs.readFileSync('supabase/migrations/'+latestLeague,'utf8');
const sqlRanks=[...sql.matchAll(/when total_xp >= (\d+) then '([a-z]+)'/g)].map(m=>[m[2],Number(m[1])]);
sqlRanks.push([(sql.match(/else '([a-z]+)' end as rank_key/)||[])[1],0]);
assert.deepStrictEqual(sqlRanks.sort((a,b)=>a[1]-b[1]),JSON.parse(JSON.stringify(R.RANKS.map(r=>[r.key,r.min]))),'league SQL ('+latestLeague+') rank thresholds match scripts/forge-ranks.js');
assert.strictEqual(R.byKey('forged').name,'Forged');
assert.strictEqual(R.byKey('nonsense'),null);
console.log('Rank and frame tests passed (including league SQL thresholds in '+latestLeague+').');
