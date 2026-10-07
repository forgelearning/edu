/* Match rewards sync across devices; pending claims survive offline play. */
(function(root){
  'use strict';
  var PREFIX='forge-rewards:';
  var MILESTONES={ember:0,ocean:0,violet:0,meadow:100,coral:750,gold:1500,plain:0,folio:300,nightfall:3000};
  function key(id){return PREFIX+String(id||'anonymous');}
  function read(id){
    var v={};try{v=JSON.parse(root.localStorage.getItem(key(id))||'{}')||{};}catch(e){}
    var rounds=v.rounds&&typeof v.rounds==='object'?v.rounds:{},pending=Array.isArray(v.pending)?v.pending:[];
    if(!('serverMatchXp' in v)&&!pending.length){
      var keys=Object.keys(rounds).sort(),short=Math.max(0,Math.round((keys.length*20-(Number(v.matchXp)||0))/5));
      pending=keys.map(function(k,i){var j=k.indexOf('|');return {day:k.slice(0,j),bank:k.slice(j+1),pairs:i<short?3:4};});
    }
    pending=pending.filter(function(p){return p&&/^\d{4}-\d\d-\d\d$/.test(p.day)&&/^[A-Za-z0-9._-]{2,80}$/.test(p.bank)&&[3,4].indexOf(p.pairs)!==-1;});
    var server=Math.max(0,Number(v.serverMatchXp)||0);
    return {quizXp:Math.max(0,Number(v.quizXp)||0),serverMatchXp:server,pending:pending,rounds:rounds,matchXp:server+pending.reduce(function(n,p){return n+p.pairs*5;},0)};
  }
  function write(id,v){try{root.localStorage.setItem(key(id),JSON.stringify(v));return true;}catch(e){return false;}}
  function total(id){var d=read(id);return d.quizXp+d.matchXp;}
  function quizXpFromResponses(rows){return (rows||[]).reduce(function(xp,r){var id=String(r.question_id||'');if(id.endsWith('-ANVIL')||id.endsWith('-CRU'))return xp+(r.is_correct?30:0);if(r.reforge_attempted)return xp+(r.reforge_correct?20:0);return xp+(r.is_correct?(r.hint_used?5:10):0);},0);}
  function rememberQuizXp(id,xp){if(!id||!Number.isFinite(Number(xp)))return;var d=read(id);d.quizXp=Math.max(0,Number(xp));write(id,d);}
  function today(){var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());var values={};parts.forEach(function(p){values[p.type]=p.value;});return values.year+'-'+values.month+'-'+values.day;}
  function context(c){
    c=typeof c==='string'?{studentId:c}:Object.assign({},c||{});
    try{var saved=JSON.parse(root.localStorage.getItem('forge-student')||'null')||JSON.parse(root.localStorage.getItem('forge-paid-student')||'null');if(saved&&saved.studentId===c.studentId){c.classCode=c.classCode||saved.classCode;c.studentCode=c.studentCode||saved.studentCode;c.studentName=c.studentName||saved.studentName||saved.name;}}catch(e){}
    return c;
  }
  function rpc(name,c,extra){
    c=context(c);var token=root.ForgeAuth&&root.ForgeAuth.accessToken&&root.ForgeAuth.accessToken();
    if(!c.studentId||!root.ForgeAPI||!token&&!c.classCode)return Promise.reject(new Error('No verified student session'));
    return root.ForgeAPI.rpc(name,Object.assign({p_student_id:String(c.studentId),p_class_code:c.classCode||null,p_student_code:c.studentCode||null,p_name:c.studentName||null},extra||{}),{token:token||root.ForgeAPI.config.key});
  }
  var syncing={};
  function load(c){
    c=context(c);if(!c.studentId)return Promise.resolve(null);
    if(syncing[c.studentId])return syncing[c.studentId];
    var id=c.studentId,d=read(id),work=Promise.resolve();
    d.pending.slice().forEach(function(p){work=work.then(function(){return rpc('claim_student_match_xp',c,{p_bank:p.bank,p_pairs:p.pairs,p_day:p.day}).then(function(result){var f=read(id);f.pending=f.pending.filter(function(x){return x.day!==p.day||x.bank!==p.bank;});f.serverMatchXp=Number(result.xp_total)||0;write(id,f);});});});
    syncing[id]=work.then(function(){return rpc('get_student_match_xp',c).then(function(result){var f=read(id);f.serverMatchXp=Number(result.xp_total)||0;write(id,f);return f;});}).finally(function(){delete syncing[id];});
    return syncing[id];
  }
  function awardMatch(c,bank,pairs,date){
    c=context(c);pairs=Number(pairs);if(!c.studentId||!bank||[3,4].indexOf(pairs)===-1)return Promise.resolve({xp:0,synced:false});
    var day=date||today(),round=day+'|'+bank,d=read(c.studentId);
    if(d.rounds[round])return Promise.resolve({xp:0,synced:true});
    return load(c).catch(function(){return null;}).then(function(){
      var f=read(c.studentId);if(f.rounds[round])return {xp:0,synced:true};
      return rpc('claim_student_match_xp',c,{p_bank:bank,p_pairs:pairs,p_day:day}).then(function(result){f=read(c.studentId);f.rounds[round]=true;f.serverMatchXp=Number(result.xp_total)||0;write(c.studentId,f);return {xp:Number(result.xp)||0,synced:true};}).catch(function(){f=read(c.studentId);f.rounds[round]=true;f.pending.push({day:day,bank:bank,pairs:pairs});write(c.studentId,f);return {xp:pairs*5,synced:false};});
    });
  }
  function unlocked(id,reward){return total(id)>=(MILESTONES[reward]||0);}
  root.ForgeRewards={MILESTONES:MILESTONES,read:read,total:total,quizXpFromResponses:quizXpFromResponses,rememberQuizXp:rememberQuizXp,awardMatch:awardMatch,load:load,unlocked:unlocked};
})(window);
