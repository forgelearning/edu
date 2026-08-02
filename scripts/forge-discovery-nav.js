/* One discovery navigation for the public Forge surface.
 * Pages keep their logo shell; this owns the links and interaction language.
 */
(function () {
  document.body.classList.add('forge-discovery');
  var nav = document.querySelector('#sticky-nav .nav-right');
  if (!nav) return;

  var audit = document.body.classList.contains('audit-test');
  var subjectPage = !!document.querySelector('.subject-header');
  var modern = audit || subjectPage;
  document.body.classList.toggle('forge-modern-nav', modern);
  var roleMenus =
    '<div class="nav-drop-wrap nav-hide-sm">' +
      '<button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">For students ▾</button>' +
      '<div class="nav-drop-menu"><a href="index.html#students">Student dashboard</a><a href="forge-quiz.html">Forge practice</a><a href="anvil.html">The Anvil</a><a href="crucible.html">The Crucible</a></div>' +
    '</div>' +
    '<div class="nav-drop-wrap nav-hide-sm">' +
      '<button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">For teachers ▾</button>' +
      '<div class="nav-drop-menu"><a href="teacher.html">Teacher dashboard</a><a href="index.html#teachers">Product tour</a><a href="guides-teacher-dashboard.html">Teacher guides</a></div>' +
    '</div>' +
    '<div class="nav-drop-wrap nav-hide-sm">' +
      '<button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">For schools ▾</button>' +
      '<div class="nav-drop-menu"><a href="school-overview.html">School overview</a><a href="school-overview.html">School analytics</a><a href="index.html#pricing">Pricing</a><a href="faq.html">Essential FAQs</a></div>' +
    '</div>';
  var mobileMenu =
      '<div class="nav-drop-wrap audit-mobile-nav-wrap"><button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">Menu ▾</button>' +
      '<div class="nav-drop-menu audit-mobile-menu"><a href="index.html#students">For students</a><a href="teacher.html">Teacher dashboard</a><a href="index.html#teachers">For teachers</a><a href="school-overview.html">For schools</a><a href="index.html#audit-faq">FAQs</a><a href="forge-quiz.html?mode=class">Join class</a><a href="forge-quiz.html">Log in</a><a href="forge-signup.html">Sign up</a></div>' +
    '</div>';
  nav.innerHTML = modern ?
    '<a class="nav-link nav-hide-sm" href="index.html#how">How it works</a>' + roleMenus +
    '<span class="audit-nav-spacer"></span><a class="nav-link audit-nav-action" href="forge-quiz.html?mode=class">Join class</a><a class="nav-link audit-nav-action" href="forge-quiz.html">Log in</a><a class="cta" href="forge-signup.html">Sign up</a>' +
    mobileMenu + '<button class="theme-toggle" id="theme-toggle" type="button" data-forge-action="theme" aria-label="Toggle light/dark theme">☀</button>' :
    '<a class="nav-link nav-hide-sm" href="index.html#how">How it works</a>' +
    '<div class="nav-drop-wrap nav-hide-sm"><button class="nav-link forge-nav-menu-button" type="button" data-forge-action="schools-menu">For schools ▾</button><div class="nav-drop-menu"><a href="faq.html">FAQ for schools</a><a href="evidence.html">The evidence</a><a href="roadmap.html">Roadmap</a><a href="privacy.html">Privacy policy</a><a href="teacher.html">Teacher dashboard</a></div></div>' +
    '<a class="nav-link nav-hide-sm audit-nav-secondary" href="guides.html">Guides</a><a class="nav-link nav-hide-sm audit-nav-secondary" href="index.html#pricing">Pricing</a><a class="nav-link nav-hide-sm" href="forge-quiz.html">Sign in</a><a class="cta" href="index.html#waitlist">Get started</a><button class="theme-toggle" id="theme-toggle" type="button" data-forge-action="theme" aria-label="Toggle light/dark theme">☀</button>';
}());
