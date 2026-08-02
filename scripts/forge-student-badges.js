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
  var k=window.SUPABASE_KEY||window.ForgeAPI&&ForgeAPI.config&&ForgeAPI.config.key;
  if(!k)return;
  var assignmentCacheKey='forge-assigned-open:'+String(saved.studentId||'anon')+':'+String(saved.classId||'none');
  var registryEntry=null;
  try{registryEntry=(JSON.parse(localStorage.getItem('forge-classes')||'[]')||[]).find(function(c){return c.classId===saved.classId;})||null}catch(e){}
  var responseContext={studentId:saved.studentId||registryEntry&&registryEntry.studentId,classCode:saved.classCode||registryEntry&&registryEntry.classCode,studentName:saved.studentName||registryEntry&&registryEntry.studentName};
  var responsePromise= responseContext.studentId&&responseContext.classCode
    ? ForgeAPI.rpc('get_student_own_responses',{p_student_id:responseContext.studentId,p_code:responseContext.classCode,p_name:responseContext.studentName}).catch(function(){return[]})
    : Promise.resolve([]);
  ForgeAPI.request('/rest/v1/assignments?select=id,class_id,due_date,created_at,banks&class_id=in.('+ids.join(',')+')')
    .then(function(rows){return Promise.all([rows,responsePromise])})
    .then(function(result){
      var rows=result[0],responses=Array.isArray(result[1])?result[1]:[];
      if(!Array.isArray(rows))return;
      var count=(Array.isArray(rows)?rows:[]).filter(function(a){
        var merged=responses.slice();
        var banks=[]; try{banks=typeof a.banks==='string'?JSON.parse(a.banks):a.banks||[]}catch(e){banks=[]}
        banks.forEach(function(bank){
          try{
            var savedSession=JSON.parse(localStorage.getItem('forge-session:'+String(saved.studentId||'anon')+':'+String(saved.classId||'none')+':'+bank)||'null');
            (savedSession&&savedSession.completedIds||[]).forEach(function(id){merged.push({question_id:id,bank:bank,is_correct:false});});
          }catch(e){}
        });
        return !ForgeAssignmentProgress.progress(a,merged).complete;
      }).length;
      ForgeSidebar.setBadge('assignments',count||null);
      try{localStorage.setItem(assignmentCacheKey,String(count))}catch(e){}
    }).catch(function(){});
})();
