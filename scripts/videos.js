(function () {
  var picker = document.getElementById('video-subject');
  if (!picker) return;
  // Subject pages are generated as videos-<slug>.html by scripts/build/build-video-pages.js.
  var subjectPage = /^videos-[a-z0-9-]+\.html$/;
  var currentPage = window.location.pathname.split('/').pop();
  var currentValue = subjectPage.test(currentPage) ? currentPage : '';
  function syncSelection() { picker.value = currentValue; }
  syncSelection();
  window.addEventListener('pageshow', syncSelection);
  picker.addEventListener('change', function () {
    var page = picker.value;
    if (subjectPage.test(page)) {
      window.location.assign(page);
    }
  });
})();
