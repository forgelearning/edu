const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const store={};
const window={localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}}};
window.window=window;
vm.createContext(window);
for(const f of ['scripts/forge-ranks.js','scripts/forge-achievements.js','scripts/forge-emblems.js','scripts/forge-celebrate.js'])vm.runInContext(fs.readFileSync(f,'utf8'),window);
const {ForgeEmblems:E,ForgeRanks:R,ForgeAchievements:A}=window;

const all=E.list();
const keys=all.map(a=>a.key);
assert.strictEqual(new Set(keys).size,keys.length,'avatar keys are unique');

// Every achievement badge unlocks exactly one Forge avatar.
for(const b of A.BADGES){const a=E.forBadge(b.key);assert(a&&a.set==='forge',b.key+' unlocks a Forge avatar');}
assert.strictEqual(all.filter(a=>a.badge).length,A.BADGES.length);
assert(all.filter(a=>a.set==='forge'&&!a.badge).length>=2,'some Forge avatars are free');

// Every subject has at least one free avatar of its own.
const vmData={window:{}};vmData.window.window=vmData.window;vm.createContext(vmData);
vm.runInContext(fs.readFileSync('data/forge-data.js','utf8')+';window.S=SUBJECTS',vmData);
for(const subject of Object.keys(vmData.window.S)){
  assert(all.some(a=>a.set==='subject'&&!a.badge&&a.subjects.includes(subject)),subject+' has a subject avatar');
}
for(const a of all.filter(a=>a.subjects))for(const s of a.subjects)assert(s in vmData.window.S,a.key+' names a real subject: '+s);

// Drawings: well-formed and inert. Flat avatars use no ids (one avatar can
// appear several times on a page); legendary ones need gradients, so each
// render gets its own ids.
for(const a of all){
  const svg=E.svg(a.key);
  assert(!/<script|\son\w+=|href=/i.test(svg),a.key+' is inert');
  for(const tag of ['g','svg','defs','linearGradient','radialGradient','clipPath'])
    assert.strictEqual((svg.match(new RegExp('<'+tag+'\\b','g'))||[]).length,(svg.match(new RegExp('</'+tag+'>','g'))||[]).length,a.key+' closes every '+tag);
  if(a.set==='legendary'){
    assert(svg.includes('class="fe-legendary"')&&/class="lg-/.test(svg),a.key+' is animated');
    const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert(ids.length,a.key+' has gradients');
    for(const ref of svg.matchAll(/url\(#([^)]+)\)/g))assert(ids.includes(ref[1]),a.key+' refers only to its own ids');
    const again=[...E.svg(a.key).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert(!again.some(id=>ids.includes(id)),a.key+' gets fresh ids each time it is drawn');
  } else {
    assert(svg.startsWith('<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="'+a.bg+'"/>'),a.key);
    assert(!/\bid=|url\(|Gradient/.test(svg),a.key+' is flat');
    assert(/^#[0-9A-F]{6}$/i.test(a.bg),a.key+' background');
  }
}
// Only some avatars are characters, and those do not all share one face.
const flat=all.filter(a=>a.set!=='legendary');
const faces=flat.filter(a=>/fe-eyes|q2-2\.8 4 0/.test(a.art));
assert(faces.length>=5&&faces.length<=flat.length/3,'a few characters with faces ('+faces.length+' of '+flat.length+')');
const mouths=new Set(faces.map(a=>(a.art.match(/h6a3 3 0 0 1-6 0z|rx="1.4" ry="1.7"|h2\.2v1\.3|q2\.4 2\.4 4\.8 0/)||['other'])[0]));
assert(mouths.size>=3,'faces vary their expression');

// Legendary avatars: lifetime XP, rising, the last at Master.
const legend=E.legendary();
assert(legend.length>=4);
legend.forEach((a,i)=>{assert(a.xp>0);if(i)assert(a.xp>legend[i-1].xp,'legendary sorted by XP');});
assert.strictEqual(legend[legend.length-1].xp,R.RANKS[R.RANKS.length-1].min,'the last legendary arrives with Master');
assert(!E.unlocked('dragon',[],14999)&&E.unlocked('dragon',[],15000));
assert(!E.unlocked('molten',[])&&E.unlocked('molten',[],legend[0].xp));
assert.strictEqual(E.svg('nonsense'),'');

// Free avatars are always open; badge ones need Bronze.
const badges=A.compute([],{});
assert(E.unlocked('globe',badges),'subject avatars are free');
assert(E.unlocked('spark',badges));
assert(!E.unlocked('anvil',badges),'no answers, no Anvil');
const withRepair=badges.map(b=>b.key==='repairs'?Object.assign({},b,{tier:A.TIERS[0]}):b);
assert(E.unlocked('anvil',withRepair));
assert(!E.unlocked('ember',withRepair));
assert(!E.unlocked('nonsense',withRepair));

// Kept per student, and only known keys are stored or read back.
assert.strictEqual(E.get('s1'),null);
assert(E.set('s1','anvil'));
assert.strictEqual(E.get('s1'),'anvil');
assert.strictEqual(E.get('s2'),null,'another student on the device keeps initials');
E.set('s1','<script>');
assert.strictEqual(E.get('s1'),null,'unknown key clears the choice');
store['forge-emblem:s1']='"><img src=x>';
assert.strictEqual(E.get('s1'),null,'a tampered value is ignored');
store['forge-emblem:s1']='constructor';
assert.strictEqual(E.get('s1'),null,'prototype names are not avatars');
E.set('s1','anvil');

// The character replaces the initials inside the same rank frame.
const own=E.ownAvatarHtml('s1','Sam Jones',2000,{size:'lg'});
assert(own.includes('forge-avatar__emblem')&&!own.includes('forge-avatar__initials'));
assert(own.includes('forge-frame--silver')&&own.includes('data-forge-own'));
assert(R.avatarHtml('Sam Jones',2000).includes('>SJ<'),'other avatars still show initials');
assert(!R.avatarHtml('Sam Jones',2000).includes('data-forge-own'));
const ladder=E.ownLadderHtml('s1','Sam',2000);
assert.strictEqual((ladder.match(/forge-avatar__emblem/g)||[]).length,R.RANKS.length,'the ladder previews the character in every frame');

// The picker: initials plus every avatar; only badge avatars can be locked;
// the student's own subject comes first among the subjects.
const picker=E.pickerHtml('s1','<b>Sam</b>',4000,withRepair,{subject:'geo'});
assert(!picker.includes('<b>Sam'),'name is escaped');
assert.strictEqual((picker.match(/data-forge-emblem=/g)||[]).length,all.length+1);
assert.strictEqual((picker.match(/ disabled/g)||[]).length,A.BADGES.length-1+legend.filter(a=>a.xp>4000).length,'locked: badge avatars not yet earned and legendary above 4,000 XP');
assert(picker.startsWith('<details class="card forge-emblems">')&&!/<details[^>]*\bopen/.test(picker),'collapsed until opened');
assert(/<summary[\s\S]*data-forge-own[\s\S]*>Anvil<[\s\S]*<\/summary>/.test(picker),'the closed row shows the current avatar and its name');
assert(picker.includes('2 of '+legend.length+' unlocked'));
assert(picker.includes('3,500 XP to go'),'a locked legendary says how far away it is');
assert(/data-forge-emblem="anvil" aria-pressed="true"/.test(picker),'current choice is pressed');
assert(picker.includes('Bronze: Longest streak'),'a locked avatar says how to unlock it');
assert(picker.indexOf('Your subject')<picker.indexOf('data-forge-emblem="globe"')&&picker.indexOf('data-forge-emblem="globe"')<picker.indexOf('More subjects'));
assert(!E.pickerHtml('s1','Sam',0,badges).includes('Your subject'),'no subject, no Your subject group');

// A first Bronze mentions the emblem; a later tier does not.
// A legendary avatar is announced once when lifetime XP passes it, never on
// a first visit, and never again after a lower total.
const C=window.ForgeCelebrate;
const kinds=r=>JSON.parse(JSON.stringify(r.events.map(e=>e.type+':'+(e.avatar?e.avatar.key:e.rank?e.rank.key:''))));
let r=C.diff(null,{xp:5000});
assert.deepStrictEqual(kinds(r),[],'first visit: recorded silently');
assert.strictEqual(r.record.legendaryXp,4000);
r=C.diff(JSON.parse(JSON.stringify(r.record)),{xp:15000});
assert.deepStrictEqual(kinds(r).sort(),['avatar:dragon','avatar:phoenix','avatar:storm','rank:master']);
assert.deepStrictEqual(kinds(C.diff(JSON.parse(JSON.stringify(r.record)),{xp:15000})),[],'never repeats');
assert.strictEqual(C.diff(JSON.parse(JSON.stringify(r.record)),{xp:100}).record.legendaryXp,15000,'never moves down');
assert.strictEqual(C.diff({rank:'forged',badges:{},badgesSeen:true,legendaryXp:7500},{badges:[]}).record.legendaryXp,7500,'a badge-only check keeps the record');
assert.deepStrictEqual(kinds(C.diff({rank:'craftsman',badges:{},badgesSeen:true},{xp:2500})),[],'legendary newly shown to an existing student: recorded silently');
const src=fs.readFileSync('scripts/forge-celebrate.js','utf8');
assert(/event\.tier\.key === 'bronze' && root\.ForgeEmblems && root\.ForgeEmblems\.forBadge/.test(src));

// Every page that draws the student's own avatar loads the module.
for(const page of ['profile','student-dashboard','student-settings','forge-quiz']){
  const html=fs.readFileSync('pages/app/'+page+'.html','utf8');
  assert(html.includes('scripts/forge-emblems.js'),page+' loads forge-emblems.js');
  assert(html.indexOf('scripts/forge-achievements.js')<html.indexOf('scripts/forge-emblems.js'),page+' loads achievements first');
}
console.log('Avatar tests passed ('+all.length+' avatars, '+all.filter(a=>!a.badge&&!a.xp).length+' free).');
