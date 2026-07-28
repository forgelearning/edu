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

  navEl.addEventListener('click', function(e){
    if (collapsed) { e.preventDefault(); e.stopPropagation(); expand(); }
  });
})();
