(function () {
  var picker = document.getElementById('video-subject');
  if (!picker) return;
  var currentPage = window.location.pathname.match(/videos-(chemistry|economics|history)\.html$/);
  var currentValue = currentPage ? currentPage[0] : '';
  function syncSelection() { picker.value = currentValue; }
  syncSelection();
  window.addEventListener('pageshow', syncSelection);
  picker.addEventListener('change', function () {
    var page = picker.value;
    if (/^videos-(chemistry|economics|history)\.html$/.test(page)) {
      window.location.assign(page);
    }
  });
})();
