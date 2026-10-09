/* A video for the question a student just got wrong.

   The video library (scripts/forge-video-library.js, generated from
   scripts/build/video-library/) lists each subject's videos by title. A
   question is matched to a video in its own subject by the words they share:
   the question's stem, its correct answer, its explanation and the label of
   the misconception it tests, against each video's title and group.

   Precision matters more than coverage. A topic can hold questions a video
   does not explain (see scripts/forge-chemistry-resources.js), and a wrong
   video after a mistake is worse than none. So the question must cover most
   of what the video's title says, judged by how distinctive each word is in
   that subject (see match()). dev/audit-video-matches.js prints coverage and
   samples for review.

   The library is loaded on the first wrong answer, not with the page. */
(function (root) {
  'use strict';

  var STOP = ('a about above after again against all also an and any are as at be because been before being below between both but by can could did do does '
    + 'doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor '
    + 'not now of off on once only or other our out over own same she should so some such than that the their them then there these they this those '
    + 'through to too under until up very was we were what when where which while who whom why will with would you your '
    + 'explain explained explanation explaining introduction intro part revision revise review overview recap summary gcse level alevel aqa edexcel ocr eduqas '
    + 'wjec ib btec topic theme paper unit component module question questions exam technique answer answers mark marks following statement best likely '
    + 'example examples key main using use used student students describe identify define definition meaning means mean '
    + 'term terms way ways type types make makes made show shows include includes including part parts').split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = true; });

  function stem(w) {
    if (w.length > 5 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 4 && /ed$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1);
    if (w.length > 4 && /e$/.test(w)) w = w.slice(0, -1);
    return w;
  }
  function words(text) {
    return String(text || '').toLowerCase().replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ')
      .replace(/[^a-z0-9À-ɏ一-鿿]+/g, ' ').split(' ')
      .filter(function (w) { return w && w.length > 1 && !STOPSET[w] && !/^\d+$/.test(w); }).map(stem);
  }

  var OPPOSITES = [['positive', 'negative'], ['increas', 'decreas'], ['appreciation', 'depreciation'], ['inflation', 'deflation'], ['surplu', 'deficit'], ['import', 'export'], ['exothermic', 'endothermic'], ['oxidation', 'reduction']].map(function (p) { return p.map(stem); });

  // How distinctive each word is within a subject, from how many of the
  // subject's questions use it: "demand" or "cost" says little in Economics,
  // "elasticity" says a lot. Built once per subject.
  var specificity = {};
  function questionText(q, label) {
    var correct = q.options && q.correct ? q.options[q.correct] : '';
    // Not the explanation: it names neighbouring ideas to contrast with, and
    // matching on those offered the unemployment video for a deflation question.
    return [q.stem || q.template || '', correct, label || ''].join(' ');
  }
  function specificityFor(subject, corpus) {
    if (specificity[subject]) return specificity[subject];
    var df = {}, n = 0;
    (corpus || []).forEach(function (q) {
      var set = {};
      words(questionText(q)).forEach(function (w) { set[w] = true; });
      Object.keys(set).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
      n++;
    });
    return (specificity[subject] = function (w) { return Math.log((n + 1) / ((df[w] || 0) + 1)) + .2; });
  }

  // The best video for a question, or null. question: a bank question;
  // subject: its subject key; label: its misconception label, if any;
  // corpus: the subject's questions, to judge which words are distinctive;
  // topic: the name of the question's topic (its bank's label).
  //
  // A video matches when the question covers most of what its title says:
  // at least 70% of the title's distinctiveness, including its most
  // distinctive word. "Price elasticity of demand" needs "elasticity";
  // "Long-run costs and returns to scale" is not offered for a question about
  // long-run aggregate supply, which shares only "long run".
  function match(library, question, subject, label, corpus, topic) {
    if (!library || !question || !subject) return null;
    var slug = library.subjects[subject], lib = slug && library.libraries[slug];
    if (!lib || !lib.videos.length) return null;
    var spec = specificityFor(subject, corpus);
    var have = {}, core = {};
    words(questionText(question, label)).forEach(function (w) { have[w] = true; });
    words(questionText(question)).forEach(function (w) { core[w] = true; });
    var topicWords = {};
    words(topic).forEach(function (w) { topicWords[w] = true; });
    var best = null;
    lib.videos.forEach(function (v) {
      var title = {};
      words(v[1]).forEach(function (w) { title[w] = true; });
      var list = Object.keys(title);
      if (!list.length) return;
      var total = 0, hit = 0, top = null;
      list.forEach(function (w) {
        var s = spec(w);
        total += s;
        if (have[w]) hit += s;
        if (!top || s > spec(top)) top = w;
      });
      var cover = hit / total;
      // The title's defining word must be in the question itself, not only
      // in its misconception label, which can be broad.
      // A one-word title ("Introduction to supply", "Types of experiment")
      // needs that word to be rare in the subject, or it catches every
      // question that mentions supply.
      if (cover < .7 || !core[top] || hit < (list.length === 1 ? 3.5 : 2.5)) return;
      // ...and to sit in the question's own topic: "Types of experiment"
      // (Research methods) is not the video for Zimbardo's Stanford Prison
      // Experiment (Social influence). Its word in the topic name, or a word
      // shared by the topic and the video's group.
      if (list.length === 1 && !topicWords[list[0]] && !words(v[2]).some(function (w) { return topicWords[w]; })) return;
      // A title about the opposite case is not the explanation.
      if (OPPOSITES.some(function (pair) { return (title[pair[0]] && !have[pair[0]] && have[pair[1]]) || (title[pair[1]] && !have[pair[1]] && have[pair[0]]); })) return;
      if (!best || cover > best.cover || (cover === best.cover && hit > best.hit)) best = { cover: cover, hit: hit, video: v };
    });
    if (!best) return null;
    var v = best.video;
    return { id: v[0], title: v[1], group: v[2], tag: v[3], noEmbed: !!v[4], subject: lib.name, score: best.cover };
  }

  // ── Page ────────────────────────────────────────────────────────────────
  var loading = null;
  function load() {
    if (root.ForgeVideoLibrary) return Promise.resolve(root.ForgeVideoLibrary);
    if (loading) return loading;
    loading = new Promise(function (resolve) {
      var s = root.document.createElement('script');
      s.src = 'scripts/forge-video-library.js';
      s.onload = function () { resolve(root.ForgeVideoLibrary || null); };
      s.onerror = function () { loading = null; resolve(null); };
      root.document.head.appendChild(s);
    });
    return loading;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Add "Still unsure? Watch: ..." to a wrong answer's feedback, above its
  // buttons. Plays in the in-page player (scripts/forge-video-player.js).
  function subjectQuestions(subject) {
    var S = root.SUBJECTS, B = root.BANKS, out = [];
    ((S && S[subject] && S[subject].banks) || []).forEach(function (b) { ((B && B[b] && B[b].questions) || []).forEach(function (q) { if (!q.coverageVariant) out.push(q); }); });
    return out;
  }
  // The topic a question belongs to, when the page does not know its bank
  // (Repair mistakes gathers questions by misconception, across banks).
  function topicFor(question) {
    var B = root.BANKS || {}, id = String(question && question.id || '').replace(/-(RF|ANVIL|CHK)$/, '');
    for (var b in B) if ((B[b].questions || []).some(function (q) { return q.id === id; })) return B[b].label || '';
    return '';
  }
  function appendTo(feedback, question, subject, topic) {
    if (!feedback || !root.document) return Promise.resolve(null);
    if (topic == null) topic = topicFor(question);
    var label = root.resolveMCLabel ? root.resolveMCLabel(question && question.tag) : '';
    return load().then(function (library) {
      var found = match(library, question, subject, label, specificity[subject] ? null : subjectQuestions(subject), topic);
      if (!found || !feedback.isConnected || feedback.querySelector('.forge-video-help')) return null;
      var watched = root.ForgeVideoPlayer && root.ForgeVideoPlayer.watched(found.id);
      var box = root.document.createElement('div');
      box.className = 'forge-video-help';
      box.innerHTML = '<a class="forge-video-help__link" href="https://www.youtube.com/watch?v=' + esc(found.id) + '" target="_blank" rel="noopener noreferrer"'
        + (found.noEmbed ? '' : ' data-video="' + esc(found.id) + '"') + '>'
        + '<span class="forge-video-help__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7.5v9l7.5-4.5z"/></svg></span>'
        + '<span class="forge-video-help__text"><small>Still unsure? ' + (watched ? 'Watch again' : 'Watch the explanation') + '</small>'
        + '<strong>' + esc(found.title) + '</strong><span>' + esc(found.tag) + (found.noEmbed ? ' · opens on YouTube' : '') + '</span></span></a>';
      // Above the buttons: the quiz wraps them in .forge-feedback-actions,
      // Repair mistakes places its button directly in the feedback.
      var actions = Array.prototype.filter.call(feedback.children, function (el) { return el.matches('.forge-feedback-actions, .next-btn'); })[0];
      if (actions) feedback.insertBefore(box, actions); else feedback.appendChild(box);
      return found;
    });
  }

  root.ForgeVideoMatch = { words: words, match: match, load: load, appendTo: appendTo, subjectQuestions: subjectQuestions, topicFor: topicFor };
}(typeof window !== 'undefined' ? window : globalThis));
