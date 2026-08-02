/* Shared, delegated page actions. Keep simple UI wiring out of markup. */
(function () {
  function invoke(action, element) {
    if (action === 'theme' && typeof window.toggleTheme === 'function') return window.toggleTheme();
    if (action === 'schools-menu') return element.nextElementSibling && element.nextElementSibling.classList.toggle('open');
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
    invoke(target.getAttribute('data-forge-action'), target);
  }
  document.addEventListener('click', handle);
  document.addEventListener('input', handle);
}());
