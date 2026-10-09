#!/usr/bin/env node
/* Build the student video library pages from scripts/build/video-library/.
 *
 * Each subject is one file there, and each becomes pages/app/videos-<slug>.html.
 * The subject picker is copied into every page, so it is generated too: adding
 * a subject means adding one library file and re-running this script, never
 * hand-editing the picker in every page.
 *
 *   node scripts/build/build-video-pages.js           write the pages
 *   node scripts/build/build-video-pages.js --check   fail if a page is stale
 *   node scripts/build/build-video-pages.js --verify-links [slug]
 *       ask YouTube (oEmbed) whether every video is still available, and
 *       whether `noEmbed` is set on exactly the videos whose owners have
 *       disabled embedding. Needs the network, so it is not part of
 *       `npm run check`.
 *
 * Videos play inside Forge (scripts/forge-video-player.js opens a
 * youtube-nocookie embed). A video marked `noEmbed: true` cannot be embedded,
 * so it links to YouTube.
 *
 * Also writes scripts/forge-video-library.js, the same library for the browser,
 * which scripts/forge-video-match.js uses to offer a video after a wrong
 * answer. Each library names the Forge subject keys it serves in `subjects`.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..', '..');
const libraryDir = path.join(__dirname, 'video-library');
const pagesDir = path.join(root, 'pages', 'app');
const browserLibrary = path.join(root, 'scripts', 'forge-video-library.js');

const LEVELS = ['A Level', 'GCSE', 'Other qualifications'];

function loadLibrary() {
  const subjects = fs.readdirSync(libraryDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => require(path.join(libraryDir, f)));
  const seen = new Set();
  for (const s of subjects) {
    for (const field of ['slug', 'subjects', 'name', 'level', 'intro', 'heading', 'groups']) {
      if (!s[field]) throw new Error(`video library: ${s.slug || '?'} is missing ${field}`);
    }
    if (!LEVELS.includes(s.level)) throw new Error(`video library: ${s.slug} has unknown level ${s.level}`);
    if (!/^[a-z0-9-]+$/.test(s.slug)) throw new Error(`video library: bad slug ${s.slug}`);
    if (seen.has(s.slug)) throw new Error(`video library: duplicate slug ${s.slug}`);
    if (!Array.isArray(s.subjects) || !s.subjects.length || s.subjects.some((k) => !/^[a-z0-9-]+$/.test(k))) throw new Error(`video library: ${s.slug} needs subjects, the Forge subject keys it serves`);
    seen.add(s.slug);
    const ids = new Set();
    for (const g of s.groups) {
      if (!g.title || !g.videos || !g.videos.length) throw new Error(`video library: ${s.slug} has an empty group`);
      for (const v of g.videos) {
        if (!/^[A-Za-z0-9_-]{11}$/.test(v.id)) throw new Error(`video library: ${s.slug} has bad video id ${v.id}`);
        if (!v.title || !v.tag) throw new Error(`video library: ${s.slug}/${v.id} needs a title and tag`);
        if ('noEmbed' in v && v.noEmbed !== true) throw new Error(`video library: ${s.slug}/${v.id} noEmbed must be true or absent`);
        if (ids.has(v.id)) throw new Error(`video library: ${s.slug} lists ${v.id} twice`);
        ids.add(v.id);
      }
    }
  }
  return subjects.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.name.localeCompare(b.name));
}

const count = (s) => s.groups.reduce((n, g) => n + g.videos.length, 0);
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function picker(subjects, current) {
  const lines = [
    '    <div class="videos-picker">',
    '      <label for="video-subject">Subject</label>',
    '      <select id="video-subject" name="subject">',
    `        <option value="" disabled${current ? '' : ' selected'}>Choose a subject</option>`,
  ];
  for (const level of LEVELS) {
    const inLevel = subjects.filter((s) => s.level === level);
    if (!inLevel.length) continue;
    lines.push(`        <optgroup label="${esc(level)}">`);
    for (const s of inLevel) {
      const selected = current && current.slug === s.slug ? ' selected' : '';
      lines.push(`          <option value="videos-${s.slug}.html"${selected}>${esc(s.name)} (${count(s)} videos)</option>`);
    }
    lines.push('        </optgroup>');
  }
  lines.push('      </select>', '    </div>');
  return lines.join('\n');
}

function section(s) {
  const id = `${s.slug}-videos-title`;
  const lines = [
    `    <section class="videos-subject" aria-labelledby="${id}">`,
    `      <div class="videos-subject-heading"><h2 id="${id}">${esc(s.name)}</h2><p>${esc(s.heading)}</p></div>`,
  ];
  for (const g of s.groups) {
    lines.push('      <div class="videos-group">', `        <h3>${esc(g.title)}</h3>`, '        <ul class="videos-list">');
    for (const v of g.videos) {
      // The link still goes to YouTube, so the page works without scripts;
      // scripts/videos.js turns a data-video link into the in-page player.
      const play = v.noEmbed ? '' : ` data-video="${v.id}"`;
      const action = v.noEmbed ? 'Opens on YouTube' : 'Watch';
      lines.push(`          <li><a href="https://www.youtube.com/watch?v=${v.id}"${play} target="_blank" rel="noopener noreferrer"><span><strong>${esc(v.title)}</strong><small>${esc(v.tag)}</small></span><span class="videos-open">${action}</span></a></li>`);
    }
    lines.push('        </ul>', '      </div>');
  }
  lines.push('    </section>');
  return lines.join('\n');
}

function page({ title, description, intro, body }) {
  return `<!doctype html>
<html lang="en-GB" data-accent-scope="student">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="expect" href="#main-content" blocking="render">
  <meta name="description" content="${esc(description)}">
  <title>${esc(title)}</title>
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/sidebar.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/page-overrides/settings.css">
  <link rel="stylesheet" href="css/page-overrides/videos.css">
</head>
<body>
  <!-- Generated by scripts/build/build-video-pages.js from scripts/build/video-library/. Edit those, not this file. -->
  <script src="scripts/forge-logo.js"></script>
  <script src="scripts/forge-role.js"></script>
  <script src="scripts/forge-rewards.js"></script>
  <script src="scripts/forge-theme.js"></script>
  <script src="scripts/forge-sidebar.js"></script>
  <script>if(window.ForgeRole)ForgeRole.guard('student','teacher.html');
  ForgeSidebar.mount({active:'videos',items:[
    {key:'dashboard',href:'student-dashboard.html',label:'Dashboard'},
    {key:'forge',href:'forge-quiz.html',label:'Forge'},
    {key:'assignments',href:'assignments.html',label:'Assigned'},
    {key:'anvil',href:'anvil.html',label:'Repair mistakes'},
    {key:'crucible',href:'crucible.html',label:'Timed practice'}
  ],footerItems:[{key:'profile',href:'profile.html',label:'Profile'}]});</script>
  <main class="wrap videos-page" id="main-content">
    <header class="settings-hero"><h1>Videos</h1><p>${esc(intro)}</p></header>
${body}
  </main>
  <script src="scripts/forge-video-player.js"></script>
  <script src="scripts/videos.js"></script>
  <script src="scripts/forge-page-actions.js"></script>
</body>
</html>
`;
}

function render(subjects) {
  const out = {
    'videos.html': page({
      title: 'Forge — Videos',
      description: 'Choose a Forge subject to watch selected topic explanation videos.',
      intro: 'Choose a subject to find topic explanations. Videos play here in Forge.',
      body: picker(subjects, null),
    }),
  };
  for (const s of subjects) {
    out[`videos-${s.slug}.html`] = page({
      title: `Forge — ${s.level === 'GCSE' ? 'GCSE ' : ''}${s.name} videos`,
      description: `Find Forge's selected ${s.level === 'GCSE' ? 'GCSE ' : ''}${s.name} explanation videos.`,
      intro: s.intro,
      body: `${picker(subjects, s)}\n${section(s)}`,
    });
  }
  return out;
}

// The library for the browser: per subject key, its library's videos as
// [id, title, group, tag, noEmbed].
function browserLibrarySource(subjects) {
  const map = {}, libraries = {};
  for (const s of subjects) {
    for (const key of s.subjects) {
      if (map[key]) throw new Error(`video library: subject ${key} is claimed by ${map[key]} and ${s.slug}`);
      map[key] = s.slug;
    }
    libraries[s.slug] = { name: (s.level === 'GCSE' ? 'GCSE ' : '') + s.name, videos: s.groups.flatMap((g) => g.videos.map((v) => [v.id, v.title, g.title, v.tag, v.noEmbed ? 1 : 0])) };
  }
  return '/* Generated by scripts/build/build-video-pages.js from scripts/build/video-library/. Edit those, not this file. */\n'
    + 'window.ForgeVideoLibrary = ' + JSON.stringify({ subjects: map, libraries }) + ';\n';
}

function oembed(id) {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
  return new Promise((resolve) => {
    https.get(url, { timeout: 20000 }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) return resolve({ ok: false, status: res.statusCode });
        try { const d = JSON.parse(body); resolve({ ok: true, title: d.title, channel: d.author_name }); }
        catch { resolve({ ok: false, status: 'bad json' }); }
      });
    }).on('error', (e) => resolve({ ok: false, status: e.message }));
  });
}

// oEmbed answers 401 for a video whose owner has disabled embedding. Such a
// video still plays on YouTube, so check the watch page's playability status
// before calling it broken; it must then be marked noEmbed in the library.
function watchPageStatus(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/watch?v=${id}`, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-GB' } }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        const m = body.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/);
        resolve(m ? m[1] : `HTTP ${res.statusCode}`);
      });
    }).on('error', (e) => resolve(e.message));
  });
}

async function check(id) {
  const r = await oembed(id);
  if (r.ok || r.status !== 401) return r;
  const status = await watchPageStatus(id);
  return status === 'OK' ? { ok: true, noEmbed: true, title: '(embedding disabled)', channel: '' } : { ok: false, status: `401, watch page ${status}` };
}

async function verifyLinks(subjects, only) {
  const videos = subjects.filter((s) => !only || s.slug === only)
    .flatMap((s) => s.groups.flatMap((g) => g.videos.map((v) => ({ slug: s.slug, ...v }))));
  let bad = 0;
  for (let i = 0; i < videos.length; i += 8) {
    const batch = videos.slice(i, i + 8);
    const results = await Promise.all(batch.map((v) => check(v.id)));
    batch.forEach((v, j) => {
      const r = results[j];
      if (!r.ok) { bad++; console.log(`UNAVAILABLE ${v.slug} ${v.id} (${r.status}) "${v.title}"`); }
      else if (!!r.noEmbed !== !!v.noEmbed) {
        bad++;
        console.log(r.noEmbed
          ? `EMBEDDING DISABLED ${v.slug} ${v.id} "${v.title}": mark it noEmbed: true so it opens on YouTube`
          : `EMBEDDABLE ${v.slug} ${v.id} "${v.title}": remove noEmbed so it plays in Forge`);
      }
      else if (process.env.VERBOSE) console.log(`ok ${v.slug} ${v.id} ${r.title} | ${r.channel}`);
    });
  }
  console.log(`${videos.length - bad}/${videos.length} videos available and correctly marked`);
  if (bad) process.exitCode = 1;
}

const subjects = loadLibrary();
const args = process.argv.slice(2);
if (args[0] === '--verify-links') {
  verifyLinks(subjects, args[1]);
} else {
  const pages = render(subjects);
  const librarySource = browserLibrarySource(subjects);
  const expected = new Set(Object.keys(pages));
  const orphans = fs.readdirSync(pagesDir).filter((f) => /^videos(-[a-z0-9-]+)?\.html$/.test(f) && !expected.has(f));
  if (args[0] === '--check') {
    const stale = Object.entries(pages).filter(([f, html]) => {
      const p = path.join(pagesDir, f);
      return !fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== html;
    }).map(([f]) => f);
    if (!fs.existsSync(browserLibrary) || fs.readFileSync(browserLibrary, 'utf8') !== librarySource) stale.push('../../scripts/forge-video-library.js');
    if (stale.length || orphans.length) {
      for (const f of stale) console.error(`stale video page: pages/app/${f}`);
      for (const f of orphans) console.error(`video page with no library entry: pages/app/${f}`);
      console.error('Run: node scripts/build/build-video-pages.js');
      process.exit(1);
    }
    console.log(`Video pages up to date: ${subjects.length} subjects, ${subjects.reduce((n, s) => n + count(s), 0)} videos.`);
  } else {
    for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(pagesDir, f), html);
    fs.writeFileSync(browserLibrary, librarySource);
    for (const f of orphans) console.warn(`warning: pages/app/${f} has no library entry; delete it if the subject was removed`);
    console.log(`Wrote ${Object.keys(pages).length} video pages: ${subjects.length} subjects, ${subjects.reduce((n, s) => n + count(s), 0)} videos.`);
  }
}
