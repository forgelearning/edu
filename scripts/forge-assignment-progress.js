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
  function progress(assignment,payload){
    var banks=list(assignment&&assignment.banks), allowed={};
    banks.forEach(function(bank){allowed[key(bank)]=bank;});
    var seen={}, answered=0, correct=0;
    rows(payload).forEach(function(response){
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
      return sum+(data&&data.questions?data.questions.filter(function(q){return !q.type||q.type==='fill_blank';}).length:0);
    },0);
    return {answered:Math.min(answered,total),correct:correct,total:total,complete:total>0&&answered>=total};
  }
  window.ForgeAssignmentProgress={rows:rows,progress:progress};
})(window);
