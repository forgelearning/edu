(function(window){
  function rows(payload){
    if(Array.isArray(payload)) return payload;
    if(payload&&Array.isArray(payload.responses)) return payload.responses;
    if(payload&&Array.isArray(payload.data)) return payload.data;
    return [];
  }
  function list(value){
    try{return Array.isArray(value)?value:(value?JSON.parse(value):[]);}catch(e){return[];}
  }
  function key(value){return String(value==null?'':value).trim().toLowerCase();}
  function bankData(){ return window.ForgeAssignmentBanks || window.BANKS || {}; }
  function availableQuestionCount(data){
    if(!data) return 0;
    if(data.assignableQuestionCount!=null) return data.assignableQuestionCount;
    return (data.questions||[]).filter(function(q){return !q.type||q.type==='fill_blank';}).length;
  }
  function bankForQuestion(id){
    var wanted=String(id||'').replace(/-RF$/,'');
    var all=bankData();
    for(var bank in all){
      if((all[bank].questions||[]).some(function(q){return String(q.id)===wanted;})) return bank;
    }
    return null;
  }
  function localSessionRows(assignment, context){
    var out=[], banks=list(assignment&&assignment.banks), createdAt=assignment&&assignment.created_at?new Date(assignment.created_at).getTime():0;
    var studentId=context&&context.studentId||'anon', classId=context&&context.classId||'none';
    banks.forEach(function(bank){
      try{
        var saved=JSON.parse(localStorage.getItem('forge-session:'+String(studentId)+':'+String(classId)+':'+bank)||'null');
        var updatedAt=saved&&saved.updatedAt?new Date(saved.updatedAt).getTime():0;
        // A generic Forge session may use the same bank as an assignment. It
        // only belongs to this assignment when it was updated after the
        // assignment was created; otherwise it would make new work appear
        // partially complete before the student has opened it.
        if(createdAt&&updatedAt&&updatedAt<createdAt)return;
        (saved&&saved.completedIds||[]).forEach(function(id){
          out.push({question_id:id,bank:bank,is_correct:false,created_at:updatedAt?new Date(updatedAt).toISOString():null});
        });
      }catch(e){}
    });
    return out;
  }
  /* THE scoring rule for assigned work. Both the student's assignment card and
     the teacher's assignment card must call through here — they used to
     implement this separately and disagreed on the same data (student 0%,
     teacher 38%, quiz evidence 31%). Three rules, all deliberate:

     1. FIRST ATTEMPT COUNTS. A reforge twin (`-RF`) is practice after a known
        wrong answer, not a second bite at assessment, so it is excluded. Rows
        are sorted oldest-first and the first attempt at a question wins, which
        also removes the old order-dependence: both surfaces received rows in
        different orders and "first seen" therefore resolved differently.
     2. ONLY THE ASSIGNMENT'S OWN WORK. Anvil (`-ANVIL`) and Crucible (`-CRU`)
        rows are separate activities. The teacher excluded them via a strict
        bank match while the student included them via a question-id lookup —
        the single largest source of the disagreement.
     3. NOTHING FROM BEFORE THE ASSIGNMENT EXISTED. Responses carry no
        assignment_id yet, so creation time is the discriminator. Once
        assignment_id lands this becomes an exact match instead of a heuristic;
        rows that carry one are already matched on it here. */
  function countable(assignment,payload){
    var createdAt=assignment&&assignment.created_at?new Date(assignment.created_at).getTime():0;
    var assignmentId=assignment&&assignment.id!=null?String(assignment.id):null;
    var out=[];
    rows(payload).forEach(function(response){
      if(!response) return;
      var rawId=String(response.question_id||response.questionId||response.id||'');
      // Rule 1 and 2: only base attempts at the assignment's own questions.
      if(/-RF$/.test(rawId)||/-ANVIL$/.test(rawId)||/-CRU$/.test(rawId)) return;
      var linked=response.assignment_id!=null?String(response.assignment_id):null;
      if(assignmentId&&linked){
        // Rule 3, exact form: the row says which assignment it belongs to.
        if(linked!==assignmentId) return;
      } else if(createdAt&&response.created_at){
        // Rule 3, heuristic form, for rows written before assignment_id.
        var at=new Date(response.created_at).getTime();
        if(at&&at<createdAt) return;
      }
      out.push({
        id:rawId,
        bank:response.bank,
        correct:!!(response.is_correct||response.isCorrect),
        selected:response.selected_option!=null?response.selected_option:(response.selectedOption!=null?response.selectedOption:null),
        at:response.created_at?new Date(response.created_at).getTime():0
      });
    });
    // Oldest first, so "first attempt" is well-defined regardless of the order
    // the caller happened to receive rows in.
    out.sort(function(a,b){return a.at-b.at;});
    return out;
  }

  /* The attempts that actually make up the score, in the order they counted.
     `progress` reduces this to numbers and `review` renders it question by
     question. They must not each re-derive it: the score a student sees and
     the answers they are shown as the reason for that score would then be
     free to disagree, which is the same failure the rules above document
     between the student and teacher surfaces. */
  function counted(assignment,payload){
    var banks=list(assignment&&assignment.banks), allowed={};
    banks.forEach(function(bank){allowed[key(bank)]=bank;});
    var seen={}, countedByBank={}, out=[];
    countable(assignment,payload).forEach(function(entry){
      var bank=allowed[key(entry.bank)]||bankForQuestion(entry.id);
      if(!bank||!allowed[key(bank)]) return;
      var marker=bank+'|'+entry.id;
      if(seen[marker]) return;
      seen[marker]=true;
      countedByBank[bank]=countedByBank[bank]||0;
      // An assignment is one focused session (up to eight questions) per
      // bank. Later free-practice answers from the same bank must not inflate
      // either the numerator or denominator after that session is complete.
      if(countedByBank[bank]>=bankTotal(bank)) return;
      countedByBank[bank]++;
      out.push({id:entry.id,bank:bank,correct:entry.correct,selected:entry.selected,at:entry.at});
    });
    return out;
  }

  function progress(assignment,payload){
    var banks=list(assignment&&assignment.banks);
    var entries=counted(assignment,payload), correct=0;
    entries.forEach(function(entry){if(entry.correct) correct++;});
    var total=banks.reduce(function(sum,bank){
      var data=bankData()[bank];
      var available=availableQuestionCount(data);
      return sum+Math.min(8,available);
    },0);
    return {answered:entries.length,correct:correct,total:total,complete:total>0&&entries.length>=total};
  }

  /* Per-question review of assigned work: what was asked, what the student
     chose, and what the right answer was. Only the attempts that scored are
     listed, so the review adds up to the percentage shown on the card. */
  function review(assignment,payload){
    var all=bankData();
    return counted(assignment,payload).map(function(entry){
      var data=all[entry.bank];
      var question=(data&&data.questions||[]).filter(function(q){return String(q.id)===entry.id;})[0]||null;
      var options=question&&question.options||[];
      var correctKey=question&&question.correct!=null?String(question.correct):null;
      var selectedKey=entry.selected!=null?String(entry.selected):null;
      return {
        id:entry.id,
        bank:entry.bank,
        bankLabel:data&&data.label||entry.bank,
        correct:entry.correct,
        stem:question&&(question.stem||question.question||question.template)||null,
        selectedLabel:selectedKey!=null&&options[selectedKey]!=null?options[selectedKey]:null,
        correctLabel:correctKey!=null&&options[correctKey]!=null?options[correctKey]:null,
        scaffold:question&&question.scaffold||null
      };
    });
  }

  /* How many of a single bank's assigned questions have been answered. The
     whole-assignment `progress` above cannot answer this, which is why
     "Open next assignment" always reopened the first bank. */
  function bankTotal(bank){
    var data=bankData()[bank];
    var available=availableQuestionCount(data);
    return Math.min(8,available);
  }
  function bankProgress(assignment,bank,payload){
    var wanted=key(bank), seen={}, answered=0, correct=0;
    var total=bankTotal(bank);
    countable(assignment,payload).forEach(function(entry){
      var responseBank=key(entry.bank)===wanted?bank:bankForQuestion(entry.id);
      if(!responseBank||key(responseBank)!==wanted) return;
      if(seen[entry.id]) return;
      if(answered>=total) return;
      seen[entry.id]=true; answered++;
      if(entry.correct) correct++;
    });
    return {answered:answered,correct:correct,total:total,complete:total>0&&answered>=total};
  }

  /* The bank a student should actually open next: the first one in the
     assignment they have not finished. Falls back to the first bank so a
     fully-complete assignment still has somewhere to point. */
  function nextBank(assignment,payload){
    var banks=list(assignment&&assignment.banks);
    for(var i=0;i<banks.length;i++){
      if(!bankProgress(assignment,banks[i],payload).complete) return banks[i];
    }
    return banks[0]||null;
  }

  window.ForgeAssignmentProgress={rows:rows,progress:progress,review:review,bankProgress:bankProgress,nextBank:nextBank,localSessionRows:localSessionRows};
})(window);
