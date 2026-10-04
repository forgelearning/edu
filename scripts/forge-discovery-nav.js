/* One header for the public Forge pages (subjects, guides, FAQ, pricing,
 * privacy, roadmap, evidence). Pages keep their logo shell; this owns the
 * links, and they match the homepage header in pages/marketing/index.html so
 * a visitor sees the same choices wherever they land. The same markup is
 * written into each page's HTML (dev/test-public-pages.js checks they agree),
 * so nothing changes when this runs; it only marks the current page.
 */
(function (root) {
  var LINKS = [
    ['index.html#how', 'How it works'],
    ['index.html#subjects', 'Subjects'],
    ['index.html#teachers', 'For teachers'],
    ['evidence.html', 'Evidence']
  ];
  var ACCOUNTS = [['role-select.html', 'Student sign in'], ['teacher.html', 'Teacher sign in']];

  function html() {
    var links = LINKS.map(function (l) { return '<a class="nav-link nav-hide-sm" href="' + l[0] + '">' + l[1] + '</a>'; }).join('');
    var menu = LINKS.concat(ACCOUNTS).map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('');
    return links +
      '<span class="audit-nav-spacer" aria-hidden="true"></span>' +
      '<a class="nav-link audit-nav-action" href="role-select.html">Sign in</a>' +
      '<a class="cta" href="forge-quiz.html">Try the quiz</a>' +
      '<div class="nav-drop-wrap audit-mobile-nav-wrap"><button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">Menu <span class="nav-chevron" aria-hidden="true"></span></button>' +
      '<div class="nav-drop-menu audit-mobile-menu">' + menu + '</div></div>' +
      '<button class="theme-toggle" id="theme-toggle" type="button" data-forge-action="theme" aria-label="Toggle light/dark theme"><span class="theme-icon" aria-hidden="true"></span></button>';
  }
  root.ForgeDiscoveryNav = { html: html };
  if (typeof document === 'undefined') return;

  document.body.classList.add('forge-discovery', 'forge-modern-nav');
  var nav = document.querySelector('#sticky-nav .nav-right');
  if (!nav) return;
  nav.innerHTML = html();

  var here = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a[href="' + here + '"]').forEach(function (a) { a.setAttribute('aria-current', 'page'); });

  // This nav is injected after the theme controller initialises, so sync the
  // newly-created toggle once it exists instead of leaving a blank control.
  if (root.setForgeTheme) root.setForgeTheme(document.documentElement.getAttribute('data-theme') === 'light', false);
}(typeof window !== 'undefined' ? window : globalThis));
