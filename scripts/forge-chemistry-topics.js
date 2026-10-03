/* AQA topic choices over the existing Chemistry banks. Question and response
 * bank IDs stay intact, so existing practice and review progress remains valid. */
(function(root){
  var PREFIX='chem-topic:';
  function list(){
    var points=(root.ForgeSpecRegistry||{}).points||{},counts={};
    ['CHEM-1','CHEM-2','CHEM-3'].forEach(function(bank){
      var inBank=((root.BANKS||{})[bank]||{}).topicCounts||{};
      Object.keys(inBank).forEach(function(id){counts[id]=(counts[id]||0)+inBank[id];});
    });
    return Object.keys(points).filter(function(id){return points[id].subject==='chem'&&counts[id]>0;}).map(function(id){
      return {id:PREFIX+id,pointId:id,code:points[id].code,label:points[id].title,count:counts[id],group:points[id].code.slice(0,3)};
    });
  }
  function pointId(topic){return String(topic||'').indexOf(PREFIX)===0?String(topic).slice(PREFIX.length):null;}
  function sourceBanks(topic){
    var id=pointId(topic);if(!id)return [topic];
    return ['CHEM-1','CHEM-2','CHEM-3'].filter(function(bank){return !!((((root.BANKS||{})[bank]||{}).topicCounts||{})[id]);});
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
  function label(topic){var item=list().filter(function(entry){return entry.id===topic;})[0];return item?item.label:topic;}
  root.ForgeChemistryTopics={list:list,pointId:pointId,sourceBanks:sourceBanks,questions:questions,label:label};
})(window);
