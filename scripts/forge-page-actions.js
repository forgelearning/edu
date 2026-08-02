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
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-forge-action]');
    if (!target) return;
    event.preventDefault();
    invoke(target.getAttribute('data-forge-action'), target);
  });
}());
