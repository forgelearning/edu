/* AQA spec-topic choices over the existing A-Level Chemistry and Physics banks.
 * Question and response bank IDs stay intact, so existing practice and review
 * progress remains valid. Named for chemistry, which used it first. */
(function(root){
  var SUBJECTS={
    chem:{prefix:'chem-topic:',banks:['CHEM-1','CHEM-2','CHEM-3'],
      groups:{'3.1.1':'Physical chemistry','3.2.1':'Inorganic chemistry','3.3.1':'Organic chemistry'}},
    // Physics questions are tagged at the AQA section level (3.1-3.13).
    // Sections 3.9-3.13 are the options; a student sits only one of them.
    phys:{prefix:'phys-topic:',banks:['PHYS-1','PHYS-2','PHYS-3'],
      groups:{'3.1':'Core content','3.9':'Optional topics'}}
  };
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
  function pointId(topic){var config=configFor(topic);return config?String(topic).slice(config.prefix.length):null;}
  function sourceBanks(topic){
    var config=configFor(topic),id=pointId(topic);if(!config)return [topic];
    return config.banks.filter(function(bank){return !!((((root.BANKS||{})[bank]||{}).topicCounts||{})[id]);});
  }
  function questions(topic){
    var id=pointId(topic);if(!id)return [];
    var out=[];
    sourceBanks(topic).forEach(function(bank){
      ((((root.BANKS||{})[bank]||{}).questions)||[]).forEach(function(question){
        if(question.specPointId===id)out.push({bank:bank,question:question});
      });
    });
    return out;
  }
  function label(topic){
    var config=configFor(topic);if(!config)return topic;
    for(var subject in SUBJECTS)if(SUBJECTS[subject]===config){
      var item=list(subject).filter(function(entry){return entry.id===topic;})[0];
      return item?item.label:topic;
    }
    return topic;
  }
  root.ForgeChemistryTopics={list:list,has:has,pointId:pointId,sourceBanks:sourceBanks,questions:questions,label:label};
})(window);
