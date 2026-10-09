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

/* Mark the videos already opened on this device. Playing is
   scripts/forge-video-player.js, shared with the quiz. */
(function () {
  var P = window.ForgeVideoPlayer;
  if (!P || !document.querySelector('.videos-list')) return;
  function showWatched(link) {
    link.classList.add('is-watched');
    var action = link.querySelector('.videos-open');
    if (action && link.hasAttribute('data-video')) action.textContent = 'Watch again';
  }
  document.querySelectorAll('.videos-list a').forEach(function (link) {
    var id = P.idOf(link);
    if (id && P.watched(id)) showWatched(link);
  });
  document.addEventListener('forge-video-watched', function (e) {
    var link = e.target.closest && e.target.closest('.videos-list a');
    if (link) showWatched(link);
  });
})();
