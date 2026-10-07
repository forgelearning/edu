/* Student-owned local rewards. Match XP is kept separate from answer rows so
 * it never changes accuracy, teacher reports, or revision scheduling. */
(function(root){
  'use strict';
  var PREFIX='forge-rewards:';
  var MILESTONES={ember:0,ocean:0,violet:0,meadow:300,coral:1500,gold:3000,plain:0,folio:500,nightfall:5000};
  function key(studentId){return PREFIX+String(studentId||'anonymous');}
  function read(studentId){
    try{
      var value=JSON.parse(root.localStorage.getItem(key(studentId))||'{}');
      return {matchXp:Math.max(0,Number(value.matchXp)||0),quizXp:Math.max(0,Number(value.quizXp)||0),rounds:value.rounds&&typeof value.rounds==='object'?value.rounds:{}};
    }catch(e){return {matchXp:0,quizXp:0,rounds:{}};}
  }
  function write(studentId,value){try{root.localStorage.setItem(key(studentId),JSON.stringify(value));return true;}catch(e){return false;}}
  function total(studentId){var data=read(studentId);return data.quizXp+data.matchXp;}
  function quizXpFromResponses(responses){
    return (responses||[]).reduce(function(xp,row){
      var id=String(row.question_id||'');
      if(id.endsWith('-ANVIL')||id.endsWith('-CRU'))return xp+(row.is_correct?30:0);
      if(row.reforge_attempted)return xp+(row.reforge_correct?20:0);
      return xp+(row.is_correct?(row.hint_used?5:10):0);
    },0);
  }
  function rememberQuizXp(studentId,xp){
    if(!studentId||!Number.isFinite(Number(xp)))return;
    var data=read(studentId);data.quizXp=Math.max(0,Number(xp));write(studentId,data);
  }
  function awardMatch(studentId,bank,pairs,date){
    if(!studentId||!bank||!pairs)return 0;
    var now=new Date(),today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    var data=read(studentId),day=date||today,round=day+'|'+bank;
    if(data.rounds[round])return 0;
    var amount=Math.min(20,Math.max(0,pairs)*5);
    data.rounds[round]=true;data.matchXp+=amount;
    return write(studentId,data)?amount:0;
  }
  function unlocked(studentId,reward){return total(studentId)>=(MILESTONES[reward]||0);}
  root.ForgeRewards={MILESTONES:MILESTONES,read:read,total:total,quizXpFromResponses:quizXpFromResponses,rememberQuizXp:rememberQuizXp,awardMatch:awardMatch,unlocked:unlocked};
})(window);
