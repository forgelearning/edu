/* Shared teacher UI helpers. */
window.ForgeTeacherUI = window.ForgeTeacherUI || {};
window.ForgeTeacherUI.escape = function(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
};
