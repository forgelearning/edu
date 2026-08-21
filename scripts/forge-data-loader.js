/* Lazy question-bank loader. forge-catalog.js provides labels and counts;
 * the selected subject replaces its empty bank shells with full questions. */
(function(root){
  var pending={};
  var loaded={};
  function register(subject,banks){
    Object.keys(banks||{}).forEach(function(bank){root.BANKS[bank]=banks[bank];});
    loaded[subject]=true;
    root.document.dispatchEvent(new CustomEvent('forge-question-data-ready',{detail:{subject:subject}}));
  }
  function loadSubject(subject){
    if(loaded[subject]) return Promise.resolve(root.BANKS);
    if(pending[subject]) return pending[subject];
    pending[subject]=new Promise(function(resolve,reject){
      var script=root.document.createElement('script');
      script.src='data/question-payloads/'+encodeURIComponent(subject)+'.js';
      script.onload=function(){loaded[subject]?resolve(root.BANKS):reject(new Error('Question payload did not register.'));};
      script.onerror=function(){delete pending[subject];reject(new Error('Question payload could not be loaded.'));};
      root.document.head.appendChild(script);
    });
    return pending[subject];
  }
  root.ForgeData={register:register,loadSubject:loadSubject,isLoaded:function(subject){return !!loaded[subject];}};
})(window);
