/* Lazy question-bank loader. forge-catalog.js provides labels and counts;
 * the selected subject replaces its empty bank shells with full questions. */
(function(root){
  var pending={};
  var loaded={};
  var bankSubjects={};
  Object.keys(root.BANKS||{}).forEach(function(bank){bankSubjects[bank]=root.BANKS[bank].subject;});
  function register(subject,banks){
    Object.keys(banks||{}).forEach(function(bank){
      var meta=root.BANKS[bank]||{};
      root.BANKS[bank]=Object.assign({},banks[bank],{
        subject:meta.subject||subject,
        questionCount:meta.questionCount,
        assignableQuestionCount:meta.assignableQuestionCount,
        crucibleQuestionCount:meta.crucibleQuestionCount
      });
    });
    loaded[subject]=true;
    root.document.dispatchEvent(new CustomEvent('forge-question-data-ready',{detail:{subject:subject}}));
  }
  function appendScript(key,src,ready,errorMessage){
    if(pending[key]) return pending[key];
    pending[key]=new Promise(function(resolve,reject){
      var script=root.document.createElement('script');
      script.src=src;
      script.onload=function(){ready()?resolve(root.BANKS):reject(new Error(errorMessage));};
      script.onerror=function(){delete pending[key];reject(new Error(errorMessage));};
      root.document.head.appendChild(script);
    });
    return pending[key];
  }
  function loadSubject(subject){
    if(loaded[subject]) return Promise.resolve(root.BANKS);
    return appendScript(subject,'data/question-payloads/'+encodeURIComponent(subject)+'.js',function(){return !!loaded[subject];},'Question payload could not be loaded.');
  }
  function loadBanks(banks){
    var subjects={};
    (banks||[]).forEach(function(bank){if(bankSubjects[bank])subjects[bankSubjects[bank]]=true;});
    return Promise.all(Object.keys(subjects).map(loadSubject)).then(function(){return root.BANKS;});
  }
  function registerRetired(banks){root.RETIRED_BANKS=banks||{};loaded.__retired=true;}
  function loadRetired(){
    if(loaded.__retired)return Promise.resolve(root.RETIRED_BANKS);
    return appendScript('__retired','data/question-payloads/retired.js',function(){return !!loaded.__retired;},'Retired question payload could not be loaded.').then(function(){return root.RETIRED_BANKS;});
  }
  function loadForResponses(responses){
    var banks=[],subjects={},unknown=false;
    (responses||[]).forEach(function(response){
      var bank=response&&response.bank;
      var subject=response&&response.subject;
      if(bankSubjects[bank])banks.push(bank);
      else if(bank&&bank!=='anvil'&&bank!=='crucible')unknown=true;
      if(subject&&root.SUBJECTS&&root.SUBJECTS[subject])subjects[subject]=true;
    });
    var work=[loadBanks(banks)].concat(Object.keys(subjects).map(loadSubject));
    if(unknown)work.push(loadRetired());
    return Promise.all(work).then(function(){return root.BANKS;});
  }
  root.ForgeData={register:register,registerRetired:registerRetired,loadSubject:loadSubject,loadBanks:loadBanks,loadForResponses:loadForResponses,loadRetired:loadRetired,isLoaded:function(subject){return !!loaded[subject];}};
})(window);
