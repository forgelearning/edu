(function() {
  if (!window.ForgeSidebar) return;
  if (document.querySelector('#free-name, #join-name, #join-code')) return;
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('forge-student') || 'null'); } catch(e) {}
  var anvilCount = null;
  try { anvilCount = parseInt(localStorage.getItem('forge-anvil-open') || '', 10); } catch(e) {}
  if (!isNaN(anvilCount)) ForgeSidebar.setBadge('anvil', anvilCount || null);
  var classIds = [];
  try {
    var linked = JSON.parse(localStorage.getItem('forge-classes') || '[]');
    if (Array.isArray(linked)) linked.forEach(function(c) { if (c.classId && classIds.indexOf(c.classId) === -1) classIds.push(c.classId); });
  } catch(e) {}
  if (saved && saved.classId && classIds.indexOf(saved.classId) === -1) classIds.push(saved.classId);
  if (!classIds.length) return;
  var url = 'https://crysulmbaadjkymcjrew.supabase.co';
  var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3ODQyNDUzMzAsImV4cCI6MjA5OTgyMTMzMH0.Q69MKJR6_iEYkqJYXjn8RBhKhstAZShtmf0NiYM-8Vk';
  fetch(url + '/rest/v1/assignments?select=id,archived,due_date&class_id=in.(' + classIds.join(',') + ')', {headers:{apikey:key,Authorization:'Bearer '+key}})
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      var today = new Date(); today.setHours(0,0,0,0);
      var count = (Array.isArray(rows) ? rows : []).filter(function(a) {
        return !a.archived && (!a.due_date || new Date(a.due_date) >= today);
      }).length;
      ForgeSidebar.setBadge('assignments', count || null);
    }).catch(function() {});
})();
