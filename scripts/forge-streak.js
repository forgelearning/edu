/* Practice streak, with a one-day freeze. Shared by Home and Profile; the
   friends list computes the same rule in SQL (get_class_friends_unchecked).

   A practice day is any local calendar day with a saved answer. One missed
   day does not break a streak; two missed days in a row do. The missed day is
   not counted, so the number is still days practised. A streak is alive while
   the latest practice day is today, yesterday or the day before.

   Days are local dates. This used to slice the UTC timestamp, which during
   British Summer Time put an answer at 00:30 on the previous day. */
(function (root) {
  var DAY = 86400000;
  function localDay(value) {
    var t = value instanceof Date ? value.getTime() : Date.parse(value || '');
    if (!Number.isFinite(t)) return null;
    var d = new Date(t);
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  }
  // Returns {days, frozen}: frozen is true when yesterday was missed and the
  // streak is only being kept by the freeze, so practising today keeps it.
  function calc(responses, now) {
    var today = localDay(now || new Date());
    var seen = {};
    (responses || []).forEach(function (r) { var d = r && localDay(r.created_at); if (d != null) seen[d] = true; });
    var days = Object.keys(seen).map(Number).sort(function (a, b) { return b - a; });
    if (!days.length || today - days[0] > 2) return { days: 0, frozen: false };
    var count = 1;
    for (var i = 1; i < days.length; i++) {
      if (days[i - 1] - days[i] > 2) break;
      count++;
    }
    return { days: count, frozen: today - days[0] === 2 };
  }
  root.ForgeStreak = { calc: calc, localDay: localDay };
})(typeof window !== 'undefined' ? window : globalThis);
