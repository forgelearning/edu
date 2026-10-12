/* AQA spec-topic choices over the existing A-Level Chemistry and Physics banks,
 * plus finer parts of single banks (Psychology's Approaches). Question and
 * response bank IDs stay intact, so existing practice and review progress
 * remains valid. Named for chemistry, which used it first. */
(function(root){
  var SUBJECTS={
    chem:{prefix:'chem-topic:',banks:['CHEM-1','CHEM-2','CHEM-3'],
      groups:{'3.1.1':'Physical chemistry','3.2.1':'Inorganic chemistry','3.3.1':'Organic chemistry'}},
    // Physics questions are tagged at the AQA section level (3.1-3.13).
    // Sections 3.9-3.13 are the options; a student sits only one of them.
    phys:{prefix:'phys-topic:',banks:['PHYS-1','PHYS-2','PHYS-3'],
      groups:{'3.1':'Core content','3.9':'Optional topics'}}
  };
  // A bank can cover one spec point yet hold several topics students want to
  // practise on their own. Parts split such a bank by misconception tag, so a
  // part's id names the real bank and responses keep recording against it.
  var PART_PREFIX='part:';
  var PARTS={
    'PSY-APP':[
      {key:'origins',label:'Origins of psychology',tags:['MC-APP-ORIGINS']},
      {key:'behaviourist',label:'Behaviourist approach',tags:['MC-APP-BEHAV','MC-APP-CLASSICAL','MC-APP-OPERANT']},
      {key:'slt',label:'Social learning theory',tags:['MC-APP-SLT']},
      {key:'cognitive',label:'Cognitive approach',tags:['MC-APP-COG']},
      {key:'biological',label:'Biological approach',tags:['MC-APP-BIO']},
      {key:'psychodynamic',label:'Psychodynamic approach',tags:['MC-APP-PSYDYN']},
      {key:'humanistic',label:'Humanistic psychology',tags:['MC-APP-HUM']},
      {key:'compare',label:'Comparing approaches',tags:['MC-APP-COMPARE']}
    ]
  };
  function partOf(topic){
    topic=String(topic||'');if(topic.indexOf(PART_PREFIX)!==0)return null;
    var rest=topic.slice(PART_PREFIX.length),cut=rest.lastIndexOf(':');if(cut<0)return null;
    var bank=rest.slice(0,cut),key=rest.slice(cut+1);
    var part=(PARTS[bank]||[]).filter(function(entry){return entry.key===key;})[0];
    return part?{bank:bank,part:part}:null;
  }
  function inPart(question,part){
    var tags=Array.isArray(question.tag)?question.tag:[question.tag];
    return tags.some(function(tag){return part.tags.indexOf(tag)>=0;});
  }
  function partQuestions(bank,part){
    return ((((root.BANKS||{})[bank]||{}).questions)||[]).filter(function(question){return inPart(question,part);});
  }
  // Parts of a bank whose questions are loaded; empty until then.
  function parts(bank){
    return (PARTS[bank]||[]).map(function(part){
      return {id:PART_PREFIX+bank+':'+part.key,bank:bank,label:part.label,count:partQuestions(bank,part).length};
    }).filter(function(entry){return entry.count>0;});
  }
  function configFor(topic){
    topic=String(topic||'');
    for(var subject in SUBJECTS)if(topic.indexOf(SUBJECTS[subject].prefix)===0)return SUBJECTS[subject];
    return null;
  }
  function counts(config){
    var out={};
    config.banks.forEach(function(bank){
      var inBank=((root.BANKS||{})[bank]||{}).topicCounts||{};
      Object.keys(inBank).forEach(function(id){out[id]=(out[id]||0)+inBank[id];});
    });
    return out;
  }
  function codeOrder(a,b){
    var x=a.code.split('.').map(Number),y=b.code.split('.').map(Number);
    for(var i=0;i<Math.max(x.length,y.length);i++)if((x[i]||0)!==(y[i]||0))return (x[i]||0)-(y[i]||0);
    return 0;
  }
  function list(subject){
    var config=SUBJECTS[subject||'chem'];if(!config)return [];
    var points=(root.ForgeSpecRegistry||{}).points||{},inBanks=counts(config);
    return Object.keys(points).filter(function(id){return points[id].subject===(subject||'chem')&&inBanks[id]>0;}).map(function(id){
      var code=points[id].code;
      return {id:config.prefix+id,pointId:id,code:code,label:points[id].title,count:inBanks[id],group:code.slice(0,3),heading:config.groups[code]||null};
    }).sort(codeOrder);
  }
  function has(subject){return !!SUBJECTS[subject]&&list(subject).length>0;}
  function pointId(topic){
    if(partOf(topic))return String(topic).slice(PART_PREFIX.length);
    var config=configFor(topic);return config?String(topic).slice(config.prefix.length):null;
  }
  function sourceBanks(topic){
    var split=partOf(topic);if(split)return [split.bank];
    var config=configFor(topic),id=pointId(topic);if(!config)return [topic];
    return config.banks.filter(function(bank){return !!((((root.BANKS||{})[bank]||{}).topicCounts||{})[id]);});
  }
  function questions(topic){
    var split=partOf(topic);
    if(split)return partQuestions(split.bank,split.part).map(function(question){return {bank:split.bank,question:question};});
    var id=pointId(topic);if(!id)return [];
    var out=[];
    sourceBanks(topic).forEach(function(bank){
      ((((root.BANKS||{})[bank]||{}).questions)||[]).forEach(function(question){
        if(question.specPointId===id)out.push({bank:bank,question:question});
      });
    });
    return out;
  }
  function find(topic){
    var split=partOf(topic);
    if(split)return parts(split.bank).filter(function(entry){return entry.id===topic;})[0]||null;
    var config=configFor(topic);if(!config)return null;
    for(var subject in SUBJECTS)if(SUBJECTS[subject]===config)return list(subject).filter(function(entry){return entry.id===topic;})[0]||null;
    return null;
  }
  function label(topic){
    var split=partOf(topic);if(split)return split.part.label;
    var item=find(topic);return item?item.label:topic;
  }
  root.ForgeChemistryTopics={list:list,has:has,parts:parts,find:find,pointId:pointId,sourceBanks:sourceBanks,questions:questions,label:label};
})(window);
