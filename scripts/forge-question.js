(function(window){
  'use strict';

  function renderOptions(question){
    var keys = Object.keys(question.options || {});
    var html = '<div class="options" id="opts">';
    keys.forEach(function(key){
      html += '<button class="opt forge-option" data-k="'+key+'"><span class="letter">'+key+'</span><span>'+question.options[key]+'</span></button>';
    });
    return html + '</div><div id="feedback"></div><div class="clear"></div>';
  }

  function scaffoldText(question){
    var scaffold = String(question && question.scaffold || '').trim();
    if (!scaffold) return 'Review the key term, connect it to the question, and explain why the other options do not fit.';

    // A batch of the GCSE History and Psychology banks still carries the
    // authoring placeholder. Turn it into a useful post-answer explanation at
    // render time while the source bank is being reviewed topic by topic.
    var generic = scaffold.match(/^This tests the specified .+? knowledge point:\s*(.+?)\.?$/i);
    if (generic) {
      return 'Key idea: ' + generic[1] + '. Recall the definition or event, then link it to the question and explain why the closest distractor is different.';
    }
    return scaffold;
  }

  function renderFeedback(question, correct){
    if(correct){
      return '<div class="praise-box"><strong class="forge-answer-status" role="status">Correct.</strong><span> Keep going.</span></div><div class="forge-feedback-actions"><button type="button" class="next-btn btn-glass btn-ember" id="next-btn">Next question \u2192</button></div>';
    }
    // Students used to see the raw taxonomy code here (MC-MICRO-CORRECTIVE-TAX).
    // It means nothing to them, and a readable label already exists for
    // essentially every tag — the Anvil and the teacher views use it.
    // resolveMCLabel returns '' when it genuinely cannot derive one, in which
    // case show no chip rather than falling back to the code.
    var label = (typeof window !== 'undefined' && window.resolveMCLabel) ? window.resolveMCLabel(question.tag) : '';
    var chip = label ? '<span class="stag">'+label+'</span>' : '';
    var html = '<div class="scaffold-box"><strong class="forge-answer-status" role="status">Not quite. Here’s the key idea.</strong>'+chip+'<p>'+scaffoldText(question)+'</p></div>';
    if(question.reforge){
      html += '<div id="rf-area" class="hidden"></div>';
    }
    html += '<div class="forge-feedback-actions">';
    if(question.reforge)html += '<button type="button" class="reforge-trigger" id="rf-btn">Try a similar question \u2192</button>';
    return html + '<button type="button" class="next-btn btn-glass btn-ember" id="next-btn">'+(question.reforge?'Continue without repair':'Next question')+' \u2192</button></div>';
  }

  function renderFillBlank(question, words, sentenceHtml){
    var html = sentenceHtml + '<div class="fb-wordbank" id="fb-bank">';
    words.forEach(function(word, index){
      html += '<button class="fb-word" data-word="'+word+'" data-wi="'+index+'">'+word+'</button>';
    });
    return html + '</div><button class="fb-check-btn" id="fb-check">Check answer</button><div id="feedback"></div><div class="clear"></div>';
  }

  // A hint for a multiple-choice question: rule out one wrong option at
  // random. It cannot reveal the answer, and needs no extra authoring, so it
  // works on every bank. Returns the removed key, or null if none was removed.
  function hintButtonHtml(){
    return '<div class="forge-hint-row"><button type="button" class="forge-hint-btn" id="hint-btn">Rule out one option</button></div>';
  }
  function ruleOutOption(question, container){
    var wrong = Array.prototype.filter.call(container.querySelectorAll('.opt'), function(opt){
      return opt.dataset.k !== question.correct && !opt.classList.contains('ruled-out');
    });
    if (wrong.length < 2) return null;
    var opt = wrong[Math.floor(Math.random() * wrong.length)];
    opt.classList.add('ruled-out');
    opt.disabled = true;
    opt.setAttribute('aria-disabled', 'true');
    opt.setAttribute('aria-label', 'Ruled out: ' + opt.textContent.trim());
    return opt.dataset.k;
  }

  window.ForgeQuestion = {
    renderOptions: renderOptions,
    hintButtonHtml: hintButtonHtml,
    ruleOutOption: ruleOutOption,
    renderFeedback: renderFeedback,
    renderFillBlank: renderFillBlank
    ,scaffoldText: scaffoldText
  };
})(window);
