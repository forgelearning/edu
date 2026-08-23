/* Shared, delegated page actions. Keep simple UI wiring out of markup. */
(function () {
  var motionMedia = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var activeSurface = null;
  var entryAnimations = typeof WeakMap === 'function' ? new WeakMap() : null;
  var lastEntries = typeof WeakMap === 'function' ? new WeakMap() : null;
  var motionActions = {
    'student-overview': true, 'student-forge': true, 'student-anvil': true, 'student-crucible': true,
    'dashboard-heatmap': true, 'dashboard-class': true, 'dashboard-student': true,
    'dashboard-starter': true, 'dashboard-assignments': true, 'student-back': true,
    'quiz-free-tier': true, 'quiz-back-banks': true, 'quiz-subjects': true, 'mr-reset': true,
    'signup-step-1': true, 'signup-step-2': true, 'switch-level': true, 'switch-tab': true,
    'anvil-home': true, 'crucible-start': true, 'crucible-build': true, 'crucible-subject': true,
    'crucible-bank': true, 'crucible-back': true, 'render-student': true,
    'render-teacher-home': true, 'render-starters': true, 'show-starter': true, 'anvil-rework': true
  };

  function reducedMotion() {
    return Boolean(motionMedia && motionMedia.matches);
  }

  function surfaceFor(element) {
    var nearby = element && element.closest
      ? element.closest('[data-forge-motion-surface],[role="tabpanel"],.auth-card,#app')
      : null;
    return nearby || document.getElementById('app') || document.querySelector('[data-forge-motion-surface],main');
  }

  function enterSurface(surface) {
    if (!surface || reducedMotion() || typeof surface.animate !== 'function') return null;
    var now = Date.now();
    if (lastEntries && now - (lastEntries.get(surface) || 0) < 100) return null;
    if (lastEntries) lastEntries.set(surface, now);
    if (entryAnimations && entryAnimations.get(surface)) entryAnimations.get(surface).cancel();
    var animation = surface.animate([
      { opacity: 0, filter: 'blur(3px)', clipPath: 'inset(0 0 5% 0)' },
      { opacity: 1, filter: 'blur(0)', clipPath: 'inset(0)' }
    ], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
    if (entryAnimations) entryAnimations.set(surface, animation);
    animation.finished.then(function () {
      if (entryAnimations && entryAnimations.get(surface) === animation) entryAnimations.delete(surface);
    }, function () {});
    return animation;
  }

  function updateSurface(element, update) {
    var surface = surfaceFor(element);
    if (!surface || reducedMotion() || activeSurface) return update();

    if (typeof document.startViewTransition === 'function') {
      activeSurface = surface;
      var root = document.documentElement;
      var oldName = surface.style.viewTransitionName;
      root.classList.add('forge-motion-local');
      surface.style.viewTransitionName = 'forge-surface';
      var transition = document.startViewTransition(update);
      function clean() {
        surface.style.viewTransitionName = oldName;
        root.classList.remove('forge-motion-local');
        activeSurface = null;
      }
      transition.finished.then(clean, clean);
      return transition;
    }

    if (typeof surface.animate !== 'function') return update();
    activeSurface = surface;
    var exit = surface.animate([
      { opacity: 1, filter: 'blur(0)', clipPath: 'inset(0)' },
      { opacity: 0, filter: 'blur(1.5px)', clipPath: 'inset(0 1.5% 0 0)' }
    ], { duration: 100, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' });
    function replace() {
      exit.cancel();
      var result;
      try { result = update(); }
      finally { activeSurface = null; }
      enterSurface(surface);
      return result;
    }
    return exit.finished.then(replace, replace);
  }

  function watchSurface(surface) {
    if (!surface || surface.dataset.forgeMotionReady || typeof MutationObserver !== 'function' || typeof requestAnimationFrame !== 'function') return;
    surface.dataset.forgeMotionReady = 'true';
    var ready = false;
    var frame = 0;
    new MutationObserver(function (records) {
      if (!ready || reducedMotion() || activeSurface) return;
      var changed = records.some(function (record) {
        return record.target === surface && (record.addedNodes.length || record.removedNodes.length);
      });
      if (!changed || frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        enterSurface(surface);
      });
    }).observe(surface, { childList: true, subtree: false });
    requestAnimationFrame(function () { ready = true; });
  }

  function initMotion() {
    document.querySelectorAll('#app,[data-forge-motion-surface]').forEach(watchSurface);
  }

  window.ForgeMotion = {
    enter: enterSurface,
    update: updateSurface,
    reduced: reducedMotion
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion);
  else initMotion();

  function closeMenu(menu) {
    if (!menu || !menu.classList.contains('open')) return;
    var button = menu.previousElementSibling;
    if (button) button.setAttribute('aria-expanded', 'false');
    if (menu._forgeCloseTimer) clearTimeout(menu._forgeCloseTimer);
    if (reducedMotion()) {
      menu.classList.remove('open', 'is-closing');
      return;
    }
    menu.classList.add('is-closing');
    menu._forgeCloseTimer = setTimeout(function () {
      menu.classList.remove('open', 'is-closing');
      menu._forgeCloseTimer = 0;
    }, 115);
  }

  function openMenu(menu, button) {
    if (!menu) return;
    if (menu._forgeCloseTimer) clearTimeout(menu._forgeCloseTimer);
    menu._forgeCloseTimer = 0;
    menu.classList.remove('is-closing');
    menu.classList.add('open');
    if (button) button.setAttribute('aria-expanded', 'true');
  }

  function invoke(action, element) {
    if (action === 'theme' && typeof window.toggleTheme === 'function') return window.toggleTheme();
    if (action === 'schools-menu') {
      var menu = element.nextElementSibling;
      var wasOpen = menu && menu.classList.contains('open');
      document.querySelectorAll('#sticky-nav .nav-drop-menu').forEach(function(other){
        if (other !== menu) closeMenu(other);
      });
      if (menu) {
        if (wasOpen) closeMenu(menu);
        else openMenu(menu, element);
      }
      return menu;
    }
    if (action === 'student-overview' && typeof window.switchStudent === 'function') return window.switchStudent('overview', element);
    if (action === 'student-forge' && typeof window.switchStudent === 'function') return window.switchStudent('forge', element);
    if (action === 'student-anvil' && typeof window.switchStudent === 'function') return window.switchStudent('anvil', element);
    if (action === 'student-crucible' && typeof window.switchStudent === 'function') return window.switchStudent('crucible', element);
    if (action === 'dashboard-heatmap' && typeof window.switchDash === 'function') return window.switchDash('heatmap', element);
    if (action === 'dashboard-class' && typeof window.switchDash === 'function') return window.switchDash('class', element);
    if (action === 'dashboard-student' && typeof window.switchDash === 'function') return window.switchDash('student', element);
    if (action === 'dashboard-starter' && typeof window.switchDash === 'function') return window.switchDash('starter', element);
    if (action === 'dashboard-assignments' && typeof window.switchDash === 'function') return window.switchDash('assignments', element);
    if (action === 'logout') {
      if (typeof window.forgeLogout === 'function') return window.forgeLogout();
      if (window.ForgeAuth && typeof window.ForgeAuth.signOut === 'function') return window.ForgeAuth.signOut();
    }
    if (action === 'theme') return typeof window.toggleTheme === 'function' ? window.toggleTheme() : null;
    if (action === 'go-quiz') return (window.location.href = 'forge-quiz.html');
    if (action === 'go-landing') return window.ForgeAuth && window.ForgeAuth.goToLanding ? window.ForgeAuth.goToLanding() : (window.location.href = 'index.html');
    if (action === 'analytics-settings') return typeof window.forgeManageAnalytics === 'function' ? window.forgeManageAnalytics() : null;
    if (action === 'created-dashboard') return typeof window._openCreatedDash === 'function' ? window._openCreatedDash() : null;
    if (action === 'copy-class-code') return typeof window.copyClassCode === 'function' ? window.copyClassCode(element) : null;
    if (action === 'anvil-back') { if (window.anvilState && window.anvilState.classId && typeof window.renderLogin === 'function') return window.renderLogin(); return (window.location.href = 'forge-quiz.html'); }
    if (action === 'quiz-free-tier' && window.state && typeof window.render === 'function') { window.state.isPaid = false; window.state.isTrial = false; window.state.phase = 'subjects'; return window.render(); }
    if (action === 'quiz-back-banks' && window.state && typeof window.render === 'function') { window.state.phase = 'banks'; return window.render(); }
    if (action === 'quiz-subjects' && window.state && typeof window.render === 'function') { window.state.phase = 'subjects'; return window.render(); }
    if (action === 'mr-reset' && window.state && typeof window.render === 'function') { window.state.mrState = { submitted: {}, tfSel: {}, mcqSel: {}, correct: 0, total: window.state.mrState && window.state.mrState.total || 0, passageIdx: 0 }; return window.render(); }
    if (action === 'student-back') { var studentPanel = document.getElementById('panel-student'), classPanel = document.getElementById('panel-class'); if (studentPanel) studentPanel.style.display = 'none'; if (classPanel) classPanel.classList.add('active'); return; }
    if (action === 'signup-step-1') return typeof window.renderStep1 === 'function' ? window.renderStep1() : null;
    if (action === 'signup-step-2') return typeof window.renderStep2 === 'function' ? window.renderStep2() : null;
    if (action === 'signup-dashboard') return typeof window.skipToDashboard === 'function' ? window.skipToDashboard() : null;
    if (action === 'switch-level' && typeof window.switchLevel === 'function') return window.switchLevel(element.dataset.level);
    if (action === 'switch-tab' && typeof window.switchTab === 'function') return window.switchTab(element.dataset.tab, element);
    if (action === 'export-csv' && typeof window.exportCSV === 'function') return window.exportCSV(element.dataset.tab);
    if (action === 'anvil-home' && typeof window.renderAnvilHome === 'function') return window.renderAnvilHome();
    if (action === 'crucible-start' && typeof window.startCrucible === 'function') return window.startCrucible();
    if (action === 'crucible-build' && typeof window.buildQuestions === 'function') { window.buildQuestions(); window.state.phase = 'ready'; return window.render(); }
    if (action === 'crucible-subject' && window.state && typeof window.render === 'function') { window.state.phase = 'subject'; return window.render(); }
    if (action === 'crucible-bank' && window.state && typeof window.render === 'function') { window.state.phase = 'bank'; return window.render(); }
    if (action === 'crucible-back' && window.state && typeof window.render === 'function') { window.state.phase = window.state.classSubject ? 'bank' : 'subject'; return window.render(); }
    if (action === 'toggle-class-link') { var linkForm = document.getElementById('class-link-form'); if (linkForm) linkForm.style.display = linkForm.style.display === 'none' ? 'block' : 'none'; return; }
    if (action === 'render-student' && typeof window.renderStudent === 'function') return window.renderStudent(element.dataset.studentId);
    if (action === 'render-teacher-home' && typeof window.renderTeacherHome === 'function') return window.renderTeacherHome();
    if (action === 'render-starters' && typeof window.renderStarters === 'function') return window.renderStarters(window.dashState && window.dashState.wrongResponses || []);
    if (action === 'show-starter' && typeof window.showStarterFor === 'function') return window.showStarterFor(element.dataset.tag);
    if (action === 'anvil-rework' && typeof window.startRework === 'function') return window.startRework(element.dataset.tag);
    if (action === 'mr-select-tf' && typeof window.mrSelectTF === 'function') return window.mrSelectTF(element.dataset.questionId, element.dataset.value);
    if (action === 'mr-select-mcq' && typeof window.mrSelectMCQ === 'function') return window.mrSelectMCQ(element.dataset.questionId, element.dataset.letter);
    if (action === 'mr-submit' && typeof window.mrSubmit === 'function') return window.mrSubmit(element.dataset.questionId);
    if (action === 'mr-find-input' && typeof window.mrFindInput === 'function') return window.mrFindInput(element.dataset.questionId);
  }
  function handle(event) {
    var target = event.target.closest('[data-forge-action]');
    if (!target) return;
    if (event.type === 'click') event.preventDefault();
    var action = target.getAttribute('data-forge-action');
    if (event.type === 'click' && motionActions[action]) {
      updateSurface(target, function () { return invoke(action, target); });
      return;
    }
    invoke(action, target);
  }
  document.addEventListener('click', handle);
  document.addEventListener('input', handle);
  document.addEventListener('keydown', function(event){
    var tab=event.target.closest('[role="tab"]');
    if(!tab||!tab.closest('[role="tablist"]')) return;
    var tabs=Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
    var index=tabs.indexOf(tab),next=null;
    if(event.key==='ArrowRight'||event.key==='ArrowDown') next=tabs[(index+1)%tabs.length];
    if(event.key==='ArrowLeft'||event.key==='ArrowUp') next=tabs[(index-1+tabs.length)%tabs.length];
    if(event.key==='Home') next=tabs[0];
    if(event.key==='End') next=tabs[tabs.length-1];
    if(!next) return;
    event.preventDefault();next.focus();next.click();
  });
}());
