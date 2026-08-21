/* Canonical misconception lifecycle used by Forge, Anvil, student profiles,
 * teacher views, and leadership reporting.
 *
 * A misconception "fires" only on an incorrect scored answer. Re-forge rows
 * then build (or reset) a consecutive-success streak. Three consecutive
 * successful Re-forges resolve the signal; a later scored error reopens it.
 * Legacy successful Re-forges sometimes have no misconception_tag, so the
 * question id is resolved back through BANKS before state is calculated. */
(function(root){
  var DEFAULT_THRESHOLD=3;
  var questionTags=null;

  function baseQuestionId(value){
    var out=String(value||''),previous;
    do { previous=out; out=out.replace(/-(RF|ANVIL|CRU\d*)$/,''); } while(out!==previous);
    return out;
  }

  function buildQuestionTags(){
    var map={};
    var banks=root.BANKS||{};
    Object.keys(banks).forEach(function(bank){
      (banks[bank].questions||[]).forEach(function(question){
        var tag=Array.isArray(question.tag)?question.tag[0]:question.tag;
        if(question.id&&tag) map[String(question.id)]=tag;
      });
    });
    questionTags=map;
  }

  function tagForRow(row){
    if(row&&row.misconception_tag) return row.misconception_tag;
    if(!questionTags) buildQuestionTags();
    return row&&questionTags[baseQuestionId(row.question_id)]||null;
  }

  function summarize(rows,options){
    options=options||{};
    var threshold=options.threshold||DEFAULT_THRESHOLD;
    var data={};
    (Array.isArray(rows)?rows:[]).map(function(row,index){return {row:row,index:index};})
      .sort(function(a,b){
        var at=Date.parse(a.row&&a.row.created_at||'')||0;
        var bt=Date.parse(b.row&&b.row.created_at||'')||0;
        return at===bt?a.index-b.index:at-bt;
      }).forEach(function(item){
        var row=item.row||{};
        var tag=tagForRow(row);
        if(!tag) return;
        if(!data[tag]) data[tag]={tag:tag,fires:0,reforgeAttempts:0,reforgeCorrect:0,streak:0,history:[],state:'unseen'};
        var signal=data[tag];
        if(row.reforge_attempted){
          signal.reforgeAttempts++;
          if(row.reforge_correct){
            signal.reforgeCorrect++;
            signal.streak++;
            signal.history.push(true);
          } else {
            signal.streak=0;
            signal.history.push(false);
          }
        } else if(!row.is_correct){
          signal.fires++;
          signal.streak=0;
          signal.history.push(false);
        }
      });

    var known=Object.keys(data).filter(function(tag){
      return data[tag].fires>0||data[tag].reforgeAttempts>0;
    });
    known.forEach(function(tag){
      var signal=data[tag];
      signal.state=signal.fires>0&&signal.streak>=threshold?'resolved':'active';
    });
    var active=known.filter(function(tag){return data[tag].state==='active';})
      .sort(function(a,b){return data[b].fires-data[a].fires||a.localeCompare(b);});
    var resolved=known.filter(function(tag){return data[tag].state==='resolved';})
      .sort(function(a,b){return data[b].fires-data[a].fires||a.localeCompare(b);});
    return {data:data,known:known,active:active,resolved:resolved,total:known.length,threshold:threshold};
  }

  function session(wrongTags,repairedTags){
    var repaired={};
    (repairedTags||[]).forEach(function(tag){if(tag) repaired[tag]=true;});
    var wrong=[];
    (wrongTags||[]).forEach(function(tag){if(tag&&wrong.indexOf(tag)===-1) wrong.push(tag);});
    return {
      repaired:wrong.filter(function(tag){return !!repaired[tag];}),
      remaining:wrong.filter(function(tag){return !repaired[tag];})
    };
  }

  root.ForgeMisconceptions={
    CLEAR_THRESHOLD:DEFAULT_THRESHOLD,
    baseQuestionId:baseQuestionId,
    tagForRow:tagForRow,
    summarize:summarize,
    session:session
  };
})(window);
