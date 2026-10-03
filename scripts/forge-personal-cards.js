/* Student-owned revision cards. The device copy is usable offline; writes are
 * queued until an account, student code, or free-session token can sync. */
(function(root){
  var chains={};
  var sequence=0;
  function stamp(){return Date.now()+'-'+(++sequence);}
  function key(context){return 'forge-personal-pending:'+String(context.studentId||'anonymous');}
  function importedKey(context){return 'forge-personal-imported:'+String(context.studentId||'anonymous');}
  function queue(context,operation){
    var pending=[];
    try{pending=JSON.parse(localStorage.getItem(key(context))||'[]');}catch(e){}
    pending=pending.filter(function(item){return item.id!==operation.id;});
    pending.push(operation);
    localStorage.setItem(key(context),JSON.stringify(pending));
  }
  function canSync(context){return !!(context&&context.studentId&&((context.classCode&&context.studentCode)||context.freeToken||(root.ForgeAuth&&ForgeAuth.accessToken())));}
  function call(context,action,card,review){
    return root.ForgeAPI.rpc('manage_student_revision_card',{
      p_student_id:String(context.studentId),
      p_class_code:context.classCode||null,
      p_student_code:context.studentCode||null,
      p_free_token:context.freeToken||null,
      p_action:action,
      p_card:card||null,
      p_review:review||null
    },{token:root.ForgeAuth&&ForgeAuth.accessToken()||root.ForgeAPI.config.key});
  }
  function drain(context){
    if(!canSync(context))return Promise.resolve();
    var pending=[];
    try{pending=JSON.parse(localStorage.getItem(key(context))||'[]');}catch(e){}
    return pending.reduce(function(chain,item){return chain.then(function(){return call(context,item.action,item.card||{id:item.id},item.review).then(function(){
      var current=[];try{current=JSON.parse(localStorage.getItem(key(context))||'[]');}catch(e){}
      localStorage.setItem(key(context),JSON.stringify(current.filter(function(op){return !(op.id===item.id&&op.updatedAt===item.updatedAt);})));
    });});},Promise.resolve());
  }
  function flush(context){
    var id=key(context),previous=chains[id]||Promise.resolve();
    var next=previous.catch(function(){}).then(function(){return drain(context);});
    chains[id]=next;
    return next.finally(function(){if(chains[id]===next)delete chains[id];});
  }
  root.ForgePersonalCards={
    canSync:canSync,
    load:function(context,localCards,reviews){
      if(!canSync(context))return Promise.resolve(null);
      return flush(context).then(function(){return call(context,'list');}).then(function(remote){
        if(localStorage.getItem(importedKey(context))==='1')return remote;
        var existing={};
        (remote||[]).forEach(function(card){existing[card.id]=true;});
        var missing=(localCards||[]).filter(function(card){return card&&card.id&&!existing[card.id];});
        return missing.reduce(function(chain,card){return chain.then(function(){return call(context,'save',card,(reviews||{})['personal|'+card.id]||null);});},Promise.resolve()).then(function(){
          localStorage.setItem(importedKey(context),'1');
          return missing.length?call(context,'list'):remote;
        });
      });
    },
    save:function(context,card,review){if(!canSync(context))return Promise.resolve();queue(context,{action:'save',id:card.id,card:card,review:review||null,updatedAt:stamp()});return flush(context);},
    remove:function(context,id){if(!canSync(context))return Promise.resolve();queue(context,{action:'delete',id:id,updatedAt:stamp()});return flush(context);}
  };
})(window);
