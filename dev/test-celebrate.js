const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const ctx={};ctx.window=ctx;
vm.createContext(ctx);
['scripts/forge-ranks.js','scripts/forge-achievements.js','scripts/forge-celebrate.js'].forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),ctx));
const C=ctx.ForgeCelebrate, A=ctx.ForgeAchievements;
const badges=tiers=>A.BADGES.map(b=>({key:b.key,name:b.name,icon:b.icon,unit:b.unit,about:b.about,value:1,tier:tiers[b.key]?A.TIERS.find(t=>t.key===tiers[b.key]):null}));
const types=r=>JSON.parse(JSON.stringify(r.events.map(e=>e.type==='rank'?'rank:'+e.rank.key:'badge:'+e.badge.key+':'+e.tier.key)));

// First visit: everything recorded, nothing announced.
let r=C.diff(null,{xp:2000,badges:badges({answers:'silver',repairs:'bronze'})});
assert.deepStrictEqual(types(r),[]);
assert.strictEqual(r.record.rank,'craftsman');
let seen=JSON.parse(JSON.stringify(r.record));

// Nothing new: no popup.
assert.deepStrictEqual(types(C.diff(seen,{xp:2100,badges:badges({answers:'silver',repairs:'bronze'})})),[]);

// A new rank, a higher tier and a first tier are all announced, once.
r=C.diff(seen,{xp:5200,badges:badges({answers:'gold',repairs:'bronze',streak:'bronze'})});
assert.deepStrictEqual(types(r).sort(),['badge:answers:gold','badge:streak:bronze','rank:forged']);
seen=JSON.parse(JSON.stringify(r.record));
assert.deepStrictEqual(types(C.diff(seen,{xp:5200,badges:badges({answers:'gold',repairs:'bronze',streak:'bronze'})})),[],'never repeats');

// A lower total (another device, a partial load) never announces or downgrades.
r=C.diff(seen,{xp:100,badges:badges({})});
assert.deepStrictEqual(types(r),[]);
assert.strictEqual(r.record.rank,'forged','the record never moves down');
assert.strictEqual(r.record.badges.answers,'gold');
assert.deepStrictEqual(types(C.diff(JSON.parse(JSON.stringify(r.record)),{xp:5200,badges:badges({answers:'gold',repairs:'bronze',streak:'bronze'})})),[],'the full total afterwards is not announced again');

// Free tier: xp null leaves the rank alone and still celebrates badges.
r=C.diff({rank:'journeyman',badges:{},badgesSeen:true},{xp:null,badges:badges({topics:'bronze'})});
assert.deepStrictEqual(types(r),['badge:topics:bronze']);
assert.strictEqual(r.record.rank,'journeyman');

// A first visit through the quiz records only the rank; Home then records the
// badges silently rather than announcing all of them.
r=C.diff(null,{xp:400});
assert.deepStrictEqual(types(r),[]);
r=C.diff(JSON.parse(JSON.stringify(r.record)),{xp:400,badges:badges({answers:'silver',repairs:'gold',topics:'bronze'})});
assert.deepStrictEqual(types(r),[],'no flood of old badges after a quiz-first visit');
assert.strictEqual(r.record.badgesSeen,true);

// Ranks newly shown (a student joins a class): recorded, not announced.
assert.deepStrictEqual(types(C.diff({rank:null,badges:{},badgesSeen:true},{xp:6000,badges:[]})),[]);

// The share card names the achievement and Forge, never the student.
const rankCard=C.cardSvg({type:'rank',rank:ctx.ForgeRanks.byKey('master')});
assert(rankCard.includes('Master')&&rankCard.includes('forgelearning.github.io/edu'));
const badgeCard=C.cardSvg({type:'badge',badge:badges({answers:'gold'})[0],tier:A.TIERS[2]});
assert(badgeCard.includes('Questions answered')&&badgeCard.includes('Gold tier'));
assert(!/Motion|Tester/.test(rankCard+badgeCard));
console.log('Celebration tests passed.');
