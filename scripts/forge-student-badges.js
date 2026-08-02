(function(){
  if(!window.ForgeSidebar)return;
  var saved=null;
  try{saved=JSON.parse(localStorage.getItem('forge-student')||'null')}catch(e){}
  // Do not resurrect a previous student's Anvil count on a signed-out page.
  // The value is only a display cache; the current session is the authority.
  if(!saved){
    ForgeSidebar.setBadge('anvil',null);
    return;
  }
  var n=parseInt(localStorage.getItem('forge-anvil-open')||'',10);
  if(!isNaN(n))ForgeSidebar.setBadge('anvil',n||null);
  var ids=[];
  try{var cs=JSON.parse(localStorage.getItem('forge-classes')||'[]');(Array.isArray(cs)?cs:[]).forEach(function(c){if(c.classId&&ids.indexOf(c.classId)<0)ids.push(c.classId)})}catch(e){}
  if(saved.classId&&ids.indexOf(saved.classId)<0)ids.push(saved.classId);
  if(!ids.length)return;
  // Keep the shared badge query on the same public key as the rest of the
  // student app so every page uses one request configuration.
  var k=window.SUPABASE_KEY;
  if(!k)return;
  var assignmentCacheKey='forge-assigned-open:'+String(saved.studentId||'anon')+':'+String(saved.classId||'none');
  var cachedAssignments=parseInt(localStorage.getItem(assignmentCacheKey)||'',10);
  if(!isNaN(cachedAssignments))ForgeSidebar.setBadge('assignments',cachedAssignments||null);
  var responsePromise= saved.studentId&&saved.classCode
    ? ForgeAPI.rpc('get_student_own_responses',{p_student_id:saved.studentId,p_code:saved.classCode,p_name:saved.studentName}).catch(function(){return[]})
    : Promise.resolve([]);
  ForgeAPI.request('/rest/v1/assignments?select=id,class_id,due_date,created_at,banks&class_id=in.('+ids.join(',')+')')
    .then(function(rows){return Promise.all([rows,responsePromise])})
    .then(function(result){
      var rows=result[0],responses=Array.isArray(result[1])?result[1]:[];
      if(!Array.isArray(rows))return;
      var count=(Array.isArray(rows)?rows:[]).filter(function(a){
        var banks=[];try{banks=typeof a.banks==='string'?JSON.parse(a.banks):a.banks||[]}catch(e){}
        var incomplete=!banks.length||banks.some(function(bank){
          var bankData=window.BANKS&&BANKS[bank];
          if(!bankData)return true;
          var ids={};
          responses.forEach(function(response){
            if(a.created_at&&(!response.created_at||new Date(response.created_at)<new Date(a.created_at)))return;
            if(response.bank===bank)ids[String(response.question_id||'').replace(/-RF$/,'')]=true;
          });
          return Object.keys(ids).length < bankData.questions.filter(function(q){return !q.type||q.type==='fill_blank'}).length;
        });
        return incomplete;
      }).length;
      ForgeSidebar.setBadge('assignments',count||null);
      try{localStorage.setItem(assignmentCacheKey,String(count))}catch(e){}
    }).catch(function(){});
})();
