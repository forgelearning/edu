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

  function renderFeedback(question, correct){
    if(correct){
      return '<div class="praise-box">\u2713 Nailed it.</div><button class="next-btn btn-glass btn-ember" id="next-btn">Next \u2192</button><div class="clear"></div>';
    }
    var html = '<div class="scaffold-box"><span class="stag">'+question.tag+'</span><p>'+question.scaffold+'</p></div>';
    if(question.reforge){
      html += '<button class="reforge-trigger" id="rf-btn">Re-forge \u2192</button><div id="rf-area" class="hidden"></div>';
    }
    return html + '<button class="next-btn btn-glass btn-ember" id="next-btn">Next \u2192</button><div class="clear"></div>';
  }

  function renderFillBlank(question, words, sentenceHtml){
    var html = sentenceHtml + '<div class="fb-wordbank" id="fb-bank">';
    words.forEach(function(word, index){
      html += '<button class="fb-word" data-word="'+word+'" data-wi="'+index+'">'+word+'</button>';
    });
    return html + '</div><button class="fb-check-btn" id="fb-check">Check answer</button><div id="feedback"></div><div class="clear"></div>';
  }

  window.ForgeQuestion = {
    renderOptions: renderOptions,
    renderFeedback: renderFeedback,
    renderFillBlank: renderFillBlank
  };
})(window);
