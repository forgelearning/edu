// Shared theme preference and toggle behaviour for every Forge surface.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function storedTheme() {
    try { return localStorage.getItem('forge-theme'); } catch (e) { return null; }
  }

  function renderTheme(light) {
    if (light) root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function (button) {
      button.textContent = light ? '☾' : '☀';
      button.setAttribute('aria-label', light ? 'Use dark theme' : 'Use light theme');
      button.setAttribute('title', light ? 'Use dark theme' : 'Use light theme');
    });
  }

  function systemIsLight() { return !!(media && media.matches); }

  window.setForgeTheme = function (light, persist) {
    renderTheme(!!light);
    if (persist) {
      try { localStorage.setItem('forge-theme', light ? 'light' : 'dark'); } catch (e) {}
    }
  };

  window.toggleTheme = function () {
    window.setForgeTheme(root.getAttribute('data-theme') !== 'light', true);
  };

  var saved = storedTheme();
  renderTheme(saved === 'light' || (saved !== 'dark' && systemIsLight()));

  if (media) {
    var onSystemChange = function () {
      if (storedTheme() !== 'light' && storedTheme() !== 'dark') renderTheme(systemIsLight());
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }
}());
