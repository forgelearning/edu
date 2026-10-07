// Shared theme preference and toggle behaviour for every Forge surface.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function storedTheme() {
    try { return localStorage.getItem('forge-theme'); } catch (e) { return null; }
  }

  var accents = { ember: true, ocean: true, violet: true, meadow: true, coral: true, gold: true };
  var backgrounds = {plain:true,folio:true,nightfall:true};
  function studentId(){
    if(window.ForgeRewardStudentId)return window.ForgeRewardStudentId;
    try{
      var value=JSON.parse(localStorage.getItem('forge-student')||'null')||JSON.parse(localStorage.getItem('forge-paid-student')||'null')||JSON.parse(localStorage.getItem('forge-free-session')||'null');
      return value&&value.studentId;
    }catch(e){return null;}
  }
  function canUse(choice){return !window.ForgeRewards||window.ForgeRewards.unlocked(studentId(),choice);}
  function storedAccent() {
    try { return localStorage.getItem('forge-accent'); } catch (e) { return null; }
  }
  function renderAccent(accent) {
    if (!root.hasAttribute('data-accent-scope')) return;
    if (accent && accents[accent] && canUse(accent) && accent !== 'ember') root.setAttribute('data-accent', accent);
    else root.removeAttribute('data-accent');
  }

  window.setForgeAccent = function (accent) {
    if (!accents[accent] || !canUse(accent)) return false;
    try {
      if (accent === 'ember') localStorage.removeItem('forge-accent');
      else localStorage.setItem('forge-accent', accent);
    } catch (e) {}
    renderAccent(accent);
    return true;
  };
  window.setForgeBackground = function(background){
    if(!backgrounds[background]||!canUse(background))return false;
    try{if(background==='plain')localStorage.removeItem('forge-background');else localStorage.setItem('forge-background',background);}catch(e){}
    renderBackground(background);return true;
  };
  function renderBackground(background){
    if(!root.hasAttribute('data-accent-scope'))return;
    if(backgrounds[background]&&canUse(background)&&background!=='plain')root.setAttribute('data-background',background);
    else root.removeAttribute('data-background');
  }
  window.refreshForgeAppearance=function(){
    renderAccent(storedAccent());
    try{renderBackground(localStorage.getItem('forge-background'));}catch(e){}
  };

  function renderTheme(light) {
    if (light) root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function (button) {
      button.innerHTML = light
        ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.2A8.3 8.3 0 0 1 8.8 3.6 8.4 8.4 0 1 0 20.4 15.2Z"/></svg>'
        : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      button.setAttribute('aria-label', light ? 'Use dark theme' : 'Use light theme');
      button.setAttribute('title', light ? 'Use dark theme' : 'Use light theme');
    });
  }

  function systemIsLight() { return !!(media && media.matches); }

  // Keep settings pages and the shared shell on the same interpretation of
  // the device preference. A page can use this without reaching into the
  // theme module's private media-query state.
  window.forgeThemeLightFor = function (preference) {
    return preference === 'light' || (preference === 'system' && systemIsLight());
  };

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
  window.refreshForgeAppearance();

  if (media) {
    var onSystemChange = function () {
      if (storedTheme() !== 'light' && storedTheme() !== 'dark') renderTheme(systemIsLight());
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }
}());
