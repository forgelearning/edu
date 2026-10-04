// Shared floating nav behaviour — sitewide.
// Closes "For schools" style dropdowns on outside click, and collapses the
// floating pill nav to just the logo badge on scroll down, expanding again
// on scroll up or near the top of the page.
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-drop-wrap')) {
    document.querySelectorAll('.nav-drop-menu').forEach(function(m){ m.classList.remove('open'); });
  }
});

(function(){
  var navEl = document.getElementById('sticky-nav');
  if (!navEl) return;

  var logoLink = navEl.querySelector('#nav-logo');
  if (logoLink && !logoLink.getAttribute('aria-label')) {
    logoLink.setAttribute('aria-label', 'Forge Learning home');
  }

  // Older static marketing markup contained duplicate class attributes on
  // the logo images. Browsers keep only the first attribute, which removes
  // the shared sizing class. Normalize the boundary once so all pages remain
  // safe while those static templates are migrated.
  navEl.querySelectorAll('img').forEach(function(img){
    img.classList.add('forge-logo-img');
    if (img.closest('#nav-shield')) img.classList.add('forge-logo-img--mark');
  });

  var lastY = window.scrollY;
  var collapsed = false;
  var directionDistance = 0;
  var scrollFrame = 0;

  // On the homepage at desktop widths the collapsed pill sat at the top-left
  // and the page's left-aligned headings scrolled underneath it. The full bar
  // has its own background, so there it simply stays in place.
  var keepFullBar = document.body.classList.contains('landing-redesign') && window.matchMedia
    ? window.matchMedia('(min-width: 901px)') : null;
  function collapse() {
    if (keepFullBar && keepFullBar.matches) return;
    navEl.classList.add('nav-collapsed'); collapsed = true;
  }
  function expand() { navEl.classList.remove('nav-collapsed'); collapsed = false; }

  function updateOnScroll(){
    scrollFrame = 0;
    var y = window.scrollY;
    var delta = y - lastY;
    lastY = y;

    if (y < 60) {
      directionDistance = 0;
      if (collapsed) expand();
      return;
    }
    if ((delta > 0 && directionDistance < 0) || (delta < 0 && directionDistance > 0)) directionDistance = 0;
    directionDistance += delta;
    // Ignore small reversals from touch momentum so the fixed bar does not
    // repeatedly resize while the page is still moving.
    if (directionDistance > 24 && !collapsed) { collapse(); directionDistance = 0; }
    else if (directionDistance < -24 && collapsed) { expand(); directionDistance = 0; }
  }
  window.addEventListener('scroll', function(){
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateOnScroll);
  }, {passive: true});

  // The collapsed logo is still a real navigation link. Do not swallow the
  // first click just to expand the pill; that makes the brand mark feel like
  // a dead control and violates normal link expectations.
  navEl.addEventListener('click', function(event){
    // The landing page's compact state keeps a real Menu control available.
    // Let that control open in place instead of expanding the full desktop bar
    // and immediately removing the focused trigger from view.
    if (collapsed && !event.target.closest('.landing-menu-wrap')) expand();
  });
})();
