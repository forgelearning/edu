// Shared theme preference and toggle behaviour for every Forge surface.
(function () {
  function setTheme(light) {
    var button = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle');
    if (light) {
      document.documentElement.setAttribute('data-theme', 'light');
      if (button) button.textContent = '☾';
      localStorage.setItem('forge-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (button) button.textContent = '☀';
      localStorage.setItem('forge-theme', 'dark');
    }
  }

  window.toggleTheme = function () {
    setTheme(document.documentElement.getAttribute('data-theme') !== 'light');
  };

  if (localStorage.getItem('forge-theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.addEventListener('DOMContentLoaded', function () { setTheme(true); });
  }
}());
