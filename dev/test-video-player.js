const assert=require('assert');
const fs=require('fs');
const path=require('path');

// Library videos play in Forge, except those whose owners disabled embedding.
const dir='scripts/build/video-library';
const lib=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>require(path.resolve(dir,f)));
const noEmbed=new Set(lib.flatMap(s=>s.groups.flatMap(g=>g.videos.filter(v=>v.noEmbed).map(v=>v.id))));
assert(noEmbed.size>0&&noEmbed.size<10,'a handful of videos are marked noEmbed');
let embedded=0;
for(const f of fs.readdirSync('pages/app').filter(f=>/^videos-.+\.html$/.test(f))){
  const html=fs.readFileSync('pages/app/'+f,'utf8');
  for(const m of html.matchAll(/<a href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"( data-video="([\w-]{11})")?/g)){
    if(noEmbed.has(m[1]))assert(!m[2],f+': '+m[1]+' cannot be embedded, so it must link out');
    else{assert.strictEqual(m[3],m[1],f+': '+m[1]+' plays in Forge');embedded++;}
  }
  assert(html.includes('scripts/videos.js'),f+' loads the player');
  assert(!/open on YouTube\./i.test(html.match(/<header class="settings-hero">[\s\S]*?<\/header>/)[0]),f+' intro no longer says videos open on YouTube');
}
assert(embedded>800);

// The player: privacy-enhanced domain, a referrer (YouTube refuses to play
// embeds without one), playback stops on close, and a way out to YouTube.
const js=fs.readFileSync('scripts/videos.js','utf8');
assert(js.includes("'https://www.youtube-nocookie.com/embed/'"));
assert(js.includes("referrerPolicy = 'strict-origin-when-cross-origin'"));
assert(js.includes('playsinline=1'),'plays inline in the iOS app');
assert(/'close'[\s\S]{0,120}frame\.innerHTML = ''/.test(js),'closing removes the iframe');
assert(js.includes('Open on YouTube'));
assert(/e\.metaKey \|\| e\.ctrlKey/.test(js),'modified clicks still open YouTube');
// Pupil pages are covered by the privacy policy's note on YouTube.
assert(fs.readFileSync('pages/marketing/privacy.html','utf8').includes('youtube-nocookie.com'));
console.log('Video player tests passed ('+embedded+' videos play in Forge, '+noEmbed.size+' link to YouTube).');
