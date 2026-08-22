/* Shared metric definitions for teacher and leadership reporting. */
(function(root){
  function rows(value){return Array.isArray(value)?value:[];}
  // Re-forges are intervention evidence, not another scored question. Forge,
  // assignments and Crucible first attempts all remain in the denominator.
  function scored(value){
    return rows(value).filter(function(row){return row&&!row.reforge_attempted;});
  }
  function accuracy(value){
    var answers=scored(value);
    var correct=answers.filter(function(row){return !!row.is_correct;}).length;
    return {answers:answers,total:answers.length,correct:correct,percent:answers.length?Math.round(correct/answers.length*100):null};
  }
  root.ForgeMetrics={scored:scored,accuracy:accuracy};
})(window);
