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

  function collapse() { navEl.classList.add('nav-collapsed'); collapsed = true; }
  function expand() { navEl.classList.remove('nav-collapsed'); collapsed = false; }

  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    var goingDown = y > lastY;
    lastY = y;

    if (y < 60) {
      if (collapsed) expand();
    } else if (goingDown && !collapsed) {
      collapse();
    } else if (!goingDown && collapsed) {
      expand();
    }
  }, {passive: true});

  // The collapsed logo is still a real navigation link. Do not swallow the
  // first click just to expand the pill; that makes the brand mark feel like
  // a dead control and violates normal link expectations.
  navEl.addEventListener('click', function(){
    if (collapsed) expand();
  });
})();
