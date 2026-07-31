(function(){
  if(!window.ForgeSidebar)return;
  var saved=null;
  try{saved=JSON.parse(localStorage.getItem('forge-student')||'null')}catch(e){}
  if(!saved)return;
  var n=parseInt(localStorage.getItem('forge-anvil-open')||'',10);
  if(!isNaN(n))ForgeSidebar.setBadge('anvil',n||null);
  var completed={};
  try{completed=JSON.parse(localStorage.getItem('forge-completed-banks')||'{}')}catch(e){}
  var ids=[];
  try{var cs=JSON.parse(localStorage.getItem('forge-classes')||'[]');(Array.isArray(cs)?cs:[]).forEach(function(c){if(c.classId&&ids.indexOf(c.classId)<0)ids.push(c.classId)})}catch(e){}
  if(saved.classId&&ids.indexOf(saved.classId)<0)ids.push(saved.classId);
  if(!ids.length)return;
  var k='sb_publishable_cPt3HxjC8-1lN8hk30BKKA_0DNow21g';
  fetch('https://crysulmbaadjkymcjrew.supabase.co/rest/v1/assignments?select=id,due_date,banks&class_id=in.('+ids.join(',')+')',{headers:{apikey:k,Authorization:'Bearer '+k}})
    .then(function(r){return r.json()})
    .then(function(rows){
      var count=(Array.isArray(rows)?rows:[]).filter(function(a){
        var banks=[];try{banks=typeof a.banks==='string'?JSON.parse(a.banks):a.banks||[]}catch(e){}
        return !banks.length||!banks.every(function(bank){return completed[bank]});
      }).length;
      if(Array.isArray(rows)) ForgeSidebar.setBadge('assignments',count||null);
    }).catch(function(){});
})();
