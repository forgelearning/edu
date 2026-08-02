/* One discovery navigation for the public Forge surface.
 * Pages keep their logo shell; this owns the links and interaction language.
 */
(function () {
  document.body.classList.add('forge-discovery');
  var nav = document.querySelector('#sticky-nav .nav-right');
  if (!nav) return;

  nav.innerHTML =
    '<a class="nav-link nav-hide-sm" href="index.html#how">How it works</a>' +
    '<div class="nav-drop-wrap nav-hide-sm">' +
      '<button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">For schools ▾</button>' +
      '<div class="nav-drop-menu">' +
        '<a href="faq.html">FAQ for schools</a>' +
        '<a href="evidence.html">The evidence</a>' +
        '<a href="roadmap.html">Roadmap</a>' +
        '<a href="privacy.html">Privacy policy</a>' +
        '<a href="teacher.html">Teacher dashboard</a>' +
      '</div>' +
    '</div>' +
    '<a class="nav-link nav-hide-sm" href="guides.html">Guides</a>' +
    '<a class="nav-link nav-hide-sm" href="index.html#pricing">Pricing</a>' +
    '<a class="nav-link nav-hide-sm" href="forge-quiz.html">Sign in</a>' +
    '<a class="cta" href="index.html#waitlist">Get started</a>' +
    '<button class="theme-toggle" id="theme-toggle" type="button" data-forge-action="theme" aria-label="Toggle light/dark theme">☀</button>';
}());
