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
  function progress(assignment,payload){
    var banks=list(assignment&&assignment.banks), allowed={};
    var createdAt=assignment&&assignment.created_at?new Date(assignment.created_at).getTime():0;
    banks.forEach(function(bank){allowed[key(bank)]=bank;});
    var seen={}, answered=0, correct=0;
    rows(payload).forEach(function(response){
      // Assignment progress must not inherit answers recorded before the
      // assignment was created. Responses are currently shared by bank/class,
      // so the creation boundary is the reliable discriminator until an
      // assignment_id column is added to the response model.
      if(createdAt&&response&&response.created_at){
        var responseAt=new Date(response.created_at).getTime();
        if(responseAt&&responseAt<createdAt)return;
      }
      var id=String(response.question_id||response.questionId||response.id||'').replace(/-RF$/,'');
      var bank=allowed[key(response.bank)]||bankForQuestion(id);
      if(!bank||!allowed[key(bank)]) return;
      var marker=bank+'|'+id;
      if(seen[marker]) return;
      seen[marker]=true; answered++;
      if(response.is_correct||response.isCorrect) correct++;
    });
    var total=banks.reduce(function(sum,bank){
      var data=bankData()[bank];
      var available=data&&data.questions?data.questions.filter(function(q){return !q.type||q.type==='fill_blank';}).length:0;
      return sum+Math.min(8,available);
    },0);
    return {answered:Math.min(answered,total),correct:correct,total:total,complete:total>0&&answered>=total};
  }
  window.ForgeAssignmentProgress={rows:rows,progress:progress,localSessionRows:localSessionRows};
})(window);
