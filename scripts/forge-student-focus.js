/* Keep a student's chosen subject and local revision queue connected across pages. */
(function(root){
  function key(studentId){return 'forge-student-subject:'+String(studentId||'anonymous');}
  function remember(studentId,subject){
    if(!studentId||!root.SUBJECTS||!root.SUBJECTS[subject])return;
    try{localStorage.setItem(key(studentId),subject);}catch(e){}
  }
  function subject(context,responses){
    var catalog=root.SUBJECTS||{},session=null,preferred=null;
    try{session=JSON.parse(localStorage.getItem('forge-student')||'null');preferred=localStorage.getItem(key(context&&context.studentId));}catch(e){}
    if(session&&session.studentId===context.studentId&&catalog[session.classSubject])return session.classSubject;
    if(catalog[preferred])return preferred;
    var rows=(responses||[]).slice().sort(function(a,b){return String(b.created_at||'').localeCompare(String(a.created_at||''));});
    for(var i=0;i<rows.length;i++){
      var bank=rows[i].bank;
      var found=Object.keys(catalog).filter(function(id){return (catalog[id].banks||[]).indexOf(bank)!==-1;})[0];
      if(found)return found;
    }
    return catalog[context&&context.subject]?context.subject:null;
  }
  function due(context,chosenSubject){
    var raw=null;
    try{raw=JSON.parse(localStorage.getItem('forge-revision:'+String(context&&context.studentId||'anonymous'))||'null');}catch(e){}
    if(!raw||!raw.reviews)return 0;
    var banks=((root.SUBJECTS||{})[chosenSubject]||{}).banks||[];
    var cards=Array.isArray(raw.personalCards)?raw.personalCards:[];
    var personal={};cards.forEach(function(card){if(card&&card.id)personal['personal|'+card.id]=true;});
    return Object.keys(raw.reviews).filter(function(cardKey){
      var review=raw.reviews[cardKey],bank=cardKey.split('|')[0];
      if(!review||!review.dueAt||!(Date.parse(review.dueAt)<=Date.now()))return false;
      return bank==='personal'?!!personal[cardKey]:banks.indexOf(bank)!==-1;
    }).length;
  }
  root.ForgeStudentFocus={remember:remember,subject:subject,due:due};
})(window);
