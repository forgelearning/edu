const assert = require('assert');
const fs = require('fs');

// Guards for the navigation fixes measured with headless Chrome at 4x CPU
// (October 2026): a black frame between pages, entrance animations replaying
// on every redraw, Home's panels collapsing and regrowing, and the loading
// card flashing before fast content.

// Every app page holds its first paint until #main-content is parsed, so the
// page that fades in already has its sidebar.
for (const f of fs.readdirSync('pages/app').filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync('pages/app/' + f, 'utf8');
  if (!html.includes('id="main-content"')) continue;
  const expect = html.indexOf('<link rel="expect" href="#main-content" blocking="render">');
  assert(expect > 0 && expect < html.indexOf('id="main-content"') && expect < html.indexOf('ForgeSidebar.mount') + (html.includes('ForgeSidebar.mount') ? 0 : html.length), f + ' holds first paint for #main-content, declared before it');
}
assert(fs.readFileSync('pages/app/assignments.html', 'utf8').includes('<main class="wrap" id="main-content">'));

// Between pages the old page is not faded out (that showed black), blending
// is normal, and the sidebar and tab bar are carried across unchanged.
const base = fs.readFileSync('css/base.css', 'utf8');
assert(base.includes('::view-transition-old(root){animation:none;mix-blend-mode:normal}'));
assert(/::view-transition-new\(root\)\{[^}]*mix-blend-mode:normal/.test(base));
assert(base.includes('#forge-sidebar{view-transition-name:forge-sidebar}') && base.includes('#forge-tabbar{view-transition-name:forge-tabbar}'));

// No entrance animation that replays whenever a page redraws.
assert(!/#app\s*>\s*\*\s*\{[^}]*animation:(?!none)/.test(fs.readFileSync('css/page-overrides/student-dashboard.css', 'utf8')), 'Home blocks do not animate in');
assert(!/animation:profile-rise/.test(fs.readFileSync('css/page-overrides/profile-overdrive.css', 'utf8')), 'Profile tabs and header do not rise in');
assert(!/^\.center\{animation/m.test(fs.readFileSync('css/page-overrides/anvil-overdrive.css', 'utf8')), 'Repair home does not arrive');

// Home keeps its league and friends panels across redraws.
const home = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
assert(home.includes("['dashboard-league','dashboard-friends','dashboard-independent-friends'].forEach") && home.includes('el.innerHTML=keptPanels[id]'));

// Loading messages wait before appearing, so fast loads never flash them.
assert(/\.forge-state--loading,\.forge-status--loading\{animation:forge-loading-appear \.2s \.35s both\}/.test(fs.readFileSync('css/components.css', 'utf8')));

// A skipped in-page transition does not log an uncaught error.
const actions = fs.readFileSync('scripts/forge-page-actions.js', 'utf8');
assert(actions.includes('transition.ready.catch(') && actions.includes('transition.updateCallbackDone.catch('));
console.log('Navigation smoothness guards passed.');
