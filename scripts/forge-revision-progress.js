/* Curated-card schedules and teacher-assignment progress. The revision page's
 * local state is the offline queue; every load/reconnection sends it to the
 * student's private server record before reading the merged result. */
(function(root){
  var chains={};
  function canSync(context){return !!(root.ForgePersonalCards&&root.ForgePersonalCards.canSync(context));}
  function call(context,reviews,assignments){
    return root.ForgeAPI.rpc('sync_student_revision_progress',{
      p_student_id:String(context.studentId),
      p_class_code:context.classCode||null,
      p_student_code:context.studentCode||null,
      p_free_token:context.freeToken||null,
      p_reviews:reviews||{},
      p_assignments:assignments||{}
    },{token:root.ForgeAuth&&ForgeAuth.accessToken()||root.ForgeAPI.config.key});
  }
  function queuedReviews(state){
    var out={};
    Object.keys(state.reviews||{}).forEach(function(key){
      var review=state.reviews[key];
      if(key.indexOf('personal|')!==0&&review&&review.lastRating&&review.dueAt){
        out[key]=Object.assign({},review,{updatedAt:review.updatedAt||'2000-01-01T00:00:00.000Z'});
      }
    });
    return out;
  }
  function queuedAssignments(state,validAssignments){
    var out={};
    Object.keys(state.assignments||{}).forEach(function(key){
      var item=state.assignments[key];
      if((!validAssignments||validAssignments.indexOf(key)!==-1)&&item&&Array.isArray(item.answered))out[key]={answered:item.answered,complete:!!item.complete};
    });
    return out;
  }
  function batches(object,size){
    var keys=Object.keys(object),out=[];
    for(var i=0;i<keys.length;i+=size){var part={};keys.slice(i,i+size).forEach(function(key){part[key]=object[key];});out.push(part);}
    return out;
  }
  function serialize(context,work){
    var key=String(context.studentId),previous=chains[key]||Promise.resolve();
    var next=previous.catch(function(){}).then(work);
    chains[key]=next;
    return next.finally(function(){if(chains[key]===next)delete chains[key];});
  }
  function merge(local,remote){
    if(!remote)return local;
    var result={reviews:Object.assign({},local.reviews||{}),assignments:Object.assign({},local.assignments||{})};
    Object.keys(remote.reviews||{}).forEach(function(key){
      var incoming=remote.reviews[key],current=result.reviews[key];
      if(!current||Date.parse(incoming.updatedAt||0)>=Date.parse(current.updatedAt||0))result.reviews[key]=incoming;
    });
    Object.keys(remote.assignments||{}).forEach(function(key){
      var incoming=remote.assignments[key],current=result.assignments[key]||{},seen={};
      (current.answered||[]).concat(incoming.answered||[]).forEach(function(card){seen[card]=true;});
      result.assignments[key]={answered:Object.keys(seen),complete:!!(current.complete||incoming.complete),updatedAt:incoming.updatedAt};
    });
    return result;
  }
  root.ForgeRevisionProgress={
    canSync:canSync,
    merge:merge,
    load:function(context,state,validAssignments){
      if(!canSync(context))return Promise.resolve(null);
      return serialize(context,function(){
        var reviewParts=batches(queuedReviews(state),80),assignmentParts=batches(queuedAssignments(state,validAssignments),40);
        var work=Promise.resolve();
        reviewParts.forEach(function(part){work=work.then(function(){return call(context,part,{});});});
        assignmentParts.forEach(function(part){work=work.then(function(){return call(context,{},part);});});
        return work.then(function(){return call(context,{},{});});
      });
    },
    save:function(context,cardKey,review,assignmentId,assignment){
      if(!canSync(context))return Promise.resolve(null);
      var reviews={},assignments={};
      if(cardKey&&review)reviews[cardKey]=review;
      if(assignmentId&&assignment)assignments[assignmentId]={answered:assignment.answered||[],complete:!!assignment.complete};
      return serialize(context,function(){return call(context,reviews,assignments);});
    }
  };
})(window);
