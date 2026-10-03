/* Small, factual progress cues for student practice. */
(function(root){
  function topicProgress(rows,bank){
    var days={},latest=null;
    (rows||[]).forEach(function(row){
      if(!row||row.bank!==bank||!row.is_correct||row.hint_used||row.reforge_attempted)return;
      var time=Date.parse(row.created_at||'');
      if(!Number.isFinite(time))return;
      var date=new Date(time),day=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
      days[day]=true;
      if(!latest||time>latest.time)latest={time:time,questionId:String(row.question_id||'')};
    });
    return {marks:Math.min(3,Object.keys(days).length),visits:Object.keys(days).length,lastQuestionId:latest&&latest.questionId||null};
  }
  function nextReturn(studentId,bank){
    var state;
    try{state=JSON.parse(localStorage.getItem('forge-revision:'+String(studentId||'anonymous'))||'null');}catch(e){return null;}
    if(!state||!state.reviews)return null;
    var dates=Object.keys(state.reviews).filter(function(key){return key.indexOf(bank+'|')===0;}).map(function(key){return Date.parse(state.reviews[key]&&state.reviews[key].dueAt||'');}).filter(Number.isFinite);
    return dates.length?Math.min.apply(null,dates):null;
  }
  function returnLabel(time){
    if(time==null)return 'No scheduled card yet. Return to this topic on another day to build the next mark.';
    if(time<=Date.now())return 'A revision card is due now.';
    return 'Next revision card: '+new Date(time).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+'.';
  }
  function motif(subject){
    if(subject==='gcse-geo'||subject==='geo')return '<svg class="forge-subject-motif forge-subject-motif--geo" viewBox="0 0 128 80" fill="none" aria-hidden="true" focusable="false"><path d="M4 69C23 61 28 44 49 46c17 2 18 18 38 14 15-3 24-18 37-20M4 51c17-7 26-23 45-23 18 0 21 15 39 13 17-2 24-13 36-17M4 32c18-5 29-19 45-19 20 0 22 12 42 11 13-1 23-8 33-13"/></svg>';
    if(subject==='gcse-econ'||subject==='econ')return '<svg class="forge-subject-motif forge-subject-motif--econ" viewBox="0 0 128 80" fill="none" aria-hidden="true" focusable="false"><path class="forge-subject-motif__axis" d="M9 8v61h112"/><path class="forge-subject-motif__line" d="M13 57 37 48 56 52 76 29 94 36 118 15"/><circle cx="118" cy="15" r="3"/></svg>';
    return '';
  }
  root.ForgeStudentDelight={topicProgress:topicProgress,nextReturn:nextReturn,returnLabel:returnLabel,motif:motif};
})(window);
