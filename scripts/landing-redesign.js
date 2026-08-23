/* Production interactions for the Forge landing page. */
(function () {
  function initSkipLink() {
    var skipLink = document.querySelector('.forge-skip-link[href="#main-content"]');
    var main = document.getElementById('main-content');
    if (!skipLink || !main) return;

    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#main-content');
      }
    });
  }

  function initAudienceTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.audience-tab'));
    if (!tabs.length) return;

    function showAudience(tab, moveFocus) {
      var target = document.getElementById('audience-' + tab.getAttribute('data-audience') + '-panel');
      if (!target) return;
      function commit() {
        tabs.forEach(function (item) {
          var active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
          item.tabIndex = active ? 0 : -1;
        });
        document.querySelectorAll('.audience-panel').forEach(function (panel) { panel.hidden = panel !== target; });
        if (moveFocus) target.focus({ preventScroll: true });
      }
      commit();
    }

    tabs.forEach(function (tab, index) {
      tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
      tab.addEventListener('click', function () { showAudience(tab, false); });
      tab.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        var nextIndex = index;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        tabs[nextIndex].focus();
        showAudience(tabs[nextIndex], false);
      });
    });
  }

  function initNavigation() {
    var toggle = document.getElementById('landing-menu-toggle');
    var menu = document.getElementById('landing-menu');
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && typeof window.setForgeTheme === 'function') {
      window.setForgeTheme(document.documentElement.getAttribute('data-theme') === 'light', false);
    }
    if (themeToggle) themeToggle.addEventListener('click', function () { if (typeof window.toggleTheme === 'function') window.toggleTheme(); });
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
      menu.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (event) { if (!event.target.closest('.landing-menu-wrap')) setOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || menu.hidden) return;
      setOpen(false);
      toggle.focus();
    });
  }

  function initDemo() {
    var demo = document.getElementById('demo');
    var body = document.getElementById('demo-body');
    var state = document.getElementById('demo-state');
    var reset = document.getElementById('demo-reset');
    if (!demo || !body || !state || !reset) return;
    var initialMarkup = body.innerHTML;

    function setState(label, className) {
      state.textContent = label;
      demo.classList.remove('is-learning', 'is-repaired', 'is-complete');
      if (className) demo.classList.add(className);
    }
    function lockOptions(scope) { scope.querySelectorAll('.opt').forEach(function (option) { option.disabled = true; }); }
    function focusFeedback(element) {
      if (!element) return;
      element.tabIndex = -1;
      window.requestAnimationFrame(function () { element.focus({ preventScroll: true }); });
    }

    function bindInitialQuestion() {
      var scaffold = document.getElementById('scaffold');
      var stag = document.getElementById('stag');
      var text = document.getElementById('stext');
      var praise = document.getElementById('praise');
      var reforge = document.getElementById('reforge');
      if (!scaffold || !stag || !text || !praise || !reforge) return;
      body.querySelectorAll('.opt').forEach(function (option) {
        option.addEventListener('click', function () {
          lockOptions(body);
          if (option.hasAttribute('data-right')) {
            option.classList.add('correct');
            praise.classList.add('show');
            setState('Concept understood', 'is-complete');
            reset.hidden = false;
            focusFeedback(praise);
            return;
          }
          option.classList.add('wrong');
          var right = body.querySelector('[data-right]');
          if (right) right.classList.add('correct');
          stag.textContent = option.getAttribute('data-mc') || 'Concept check';
          text.innerHTML = option.getAttribute('data-s') || 'Review the idea, then apply it in a new context.';
          scaffold.classList.add('show');
          setState('Repair started', 'is-learning');
          reset.hidden = false;
          focusFeedback(scaffold);
        });
      });
      reforge.addEventListener('click', showReforgedQuestion);
    }

    function showReforgedQuestion() {
      setState('Fresh proof', 'is-learning');
      body.classList.add('demo-body--reforged');
      body.innerHTML = '<p class="stimulus">Japan records annual inflation of −0.4%. A report says consumer prices are now lower than one year ago.</p>' +
        '<p class="q" tabindex="-1">Which term describes this change in the price level?</p>' +
        '<button type="button" class="opt">Disinflation</button><button type="button" class="opt" data-right="1">Deflation</button>' +
        '<button type="button" class="opt">Reflation</button><button type="button" class="opt">Stagflation</button>' +
        '<p class="praise" id="praise2" tabindex="-1">Concept repaired. Below-zero inflation means the price level fell.</p>' +
        '<p class="praise forge-text-bad" id="miss2" tabindex="-1">Not yet. Below zero means deflation: the price level itself fell. The full app would add this idea to Anvil for another pass.</p>';
      focusFeedback(body.querySelector('.q'));
      body.querySelectorAll('.opt').forEach(function (option) {
        option.addEventListener('click', function () {
          lockOptions(body);
          var right = body.querySelector('[data-right]');
          if (option.hasAttribute('data-right')) {
            option.classList.add('correct');
            var repaired = document.getElementById('praise2');
            repaired.classList.add('show');
            setState('Concept repaired', 'is-repaired');
            focusFeedback(repaired);
          } else {
            option.classList.add('wrong');
            if (right) right.classList.add('correct');
            var missed = document.getElementById('miss2');
            missed.classList.add('show');
            setState('Needs another pass', 'is-learning');
            focusFeedback(missed);
          }
          reset.hidden = false;
        });
      });
    }

    reset.addEventListener('click', function () {
      body.innerHTML = initialMarkup;
      body.classList.remove('demo-body--reforged');
      reset.hidden = true;
      setState('Repair started', '');
      bindInitialQuestion();
      var first = body.querySelector('.opt');
      if (first) first.focus();
    });
    bindInitialQuestion();
  }

  function initPilotForm() {
    var form = document.getElementById('waitform');
    var done = document.getElementById('waitdone');
    var error = document.getElementById('waiterror');
    if (!form || !done || !error) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector('button[type="submit"]');
      var email = document.getElementById('email').value.trim();
      error.hidden = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      fetch('https://formspree.io/f/meeyaylp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, _subject: 'New Forge school pilot update request: ' + email })
      }).then(function (response) {
        if (!response.ok) throw new Error('pilot update request failed');
        form.hidden = true;
        done.hidden = false;
      }).catch(function () {
        button.disabled = false;
        button.textContent = 'Get pilot updates';
        error.hidden = false;
      }).finally(function () { form.removeAttribute('aria-busy'); });
    });
  }

  initSkipLink();
  initNavigation();
  initDemo();
  initAudienceTabs();
  initPilotForm();
})();
