/* Forge Revision: curated retrieval practice for every catalog subject.
 * Assignment metadata is carried by a reserved entry in assignments.banks. */
(function(root){
  var TOPICS={
    'GCSE-GEO-HAZ':{label:'Hazardous Earth',description:'Plate boundaries, volcanic processes and hazard response',tone:'ember'},
    'GCSE-GEO-BIOSPHERE':{label:'People and the Biosphere',description:'Biomes, ecosystem services and human pressure',tone:'blue'},
    'GCSE-GEO-DEV':{label:'Development Dynamics',description:'Measures, inequality and models of development',tone:'gold'}
  };
  var PREFIX='__FORGE_REVISION_';

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>'"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch];});
  }
  function rawBanks(value){try{return Array.isArray(value)?value:(value?JSON.parse(value):[]);}catch(e){return[];}}
  function config(assignment){
    var marker=rawBanks(assignment&&assignment.banks).filter(function(item){return String(item).indexOf(PREFIX)===0;})[0];
    if(!marker)return null;
    var value=String(marker).slice(PREFIX.length).replace(/__$/,'');
    return {mode:value==='DUE'?'due':'count',target:value==='DUE'?null:Math.max(1,parseInt(value,10)||10),marker:marker};
  }
  function banks(assignment){return rawBanks(assignment&&assignment.banks).filter(function(item){return String(item).indexOf(PREFIX)!==0;});}
  function isRevision(assignment){return !!config(assignment);}
  function markerFor(value){return PREFIX+(value==='due'?'DUE':String(parseInt(value,10)||10))+'__';}
  function cardKey(bank,question){return bank+'|'+question.id;}
  function storageKey(context){return 'forge-revision:'+String(context&&context.studentId||'anonymous');}
  function readState(context){
    var state;
    try{state=JSON.parse(localStorage.getItem(storageKey(context))||'{}');}catch(e){state={};}
    state.reviews=state.reviews||{};state.assignments=state.assignments||{};
    state.personalCards=Array.isArray(state.personalCards)?state.personalCards:[];
    return state;
  }
  function writeState(context,state){try{localStorage.setItem(storageKey(context),JSON.stringify(state));return true;}catch(e){return false;}}
  function syncReview(context,card,rating,dueAt,assignment){
    if(!context||!context.classCode||!context.studentCode||!root.ForgeStudentCode||!root.ForgeStudentCode.recordRevisionReview)return;
    root.ForgeStudentCode.recordRevisionReview(context.studentId,context.classCode,context.studentCode,{card_key:card.key,bank:card.bank,rating:rating,due_at:dueAt,assignment_id:assignment&&assignment.id||null}).catch(function(){
      // Local progress remains authoritative for continuity if the network is unavailable.
    });
  }
  function addDays(date,days){var next=new Date(date);next.setDate(next.getDate()+days);return next;}
  function nextDue(rating,previous){
    var now=new Date();
    if(rating==='again'){now.setHours(now.getHours()+4);return now;}
    if(rating==='nearly')return addDays(now,1);
    var reviews=(previous&&previous.secureReviews||0)+1;
    return addDays(now,reviews===1?7:reviews===2?14:30);
  }
  function availableCards(selectedBanks){
    var out=[];
    (selectedBanks||[]).forEach(function(bank){
      if(root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(bank)){
        root.ForgeChemistryTopics.questions(bank).forEach(function(item){
          var question=item.question;
          if(question&&question.id&&question.options&&question.correct!=null)out.push({bank:item.bank,question:question,key:cardKey(item.bank,question)});
        });
        return;
      }
      var data=(root.BANKS||{})[bank];
      (data&&data.questions||[]).forEach(function(question){
        if(question&&question.id&&question.options&&question.correct!=null){out.push({bank:bank,question:question,key:cardKey(bank,question)});}
      });
    });
    return out;
  }
  function hash(value){var h=2166136261;for(var i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function ordered(cards,context,state){
    var today=new Date().toISOString().slice(0,10),seed=String(context&&context.studentId||'student')+'|'+today;
    return cards.slice().sort(function(a,b){
      var ar=state.reviews[a.key],br=state.reviews[b.key];
      var ad=ar?Date.parse(ar.dueAt||0):Infinity,bd=br?Date.parse(br.dueAt||0):Infinity;
      if(ad!==bd)return ad-bd;
      return hash(seed+a.key)-hash(seed+b.key);
    });
  }
  function dueCards(cards,state){var now=Date.now();return cards.filter(function(card){var r=state.reviews[card.key];return r&&Date.parse(r.dueAt||0)<=now;});}
  function modelAnswer(question){return question&&question.options&&question.options[question.correct]||'';}
  // "Help me start" used to give every card the same sentence, because no
  // question carries a `hint`. Build one from the card's own answer instead:
  // the first letter and length of each of its first six words. Opening words
  // would be too strong — answers are often "Key term — explanation", so they
  // name the very term being recalled. Numeric and character-based answers
  // (maths, Mandarin) have no useful letter shape, so they keep the general
  // prompt and "Show choices" remains the stronger help. Returns HTML.
  var GENERAL_HINT='Start with one fact or process you remember about this topic. How does it answer the question?';
  var HINT_WORDS=6;
  function hintHtml(question){
    var authored=String(question&&question.hint||'').trim();
    if(authored)return escapeHtml(authored);
    var answer=String(modelAnswer(question)).replace(/\s+/g,' ').trim(),words=answer.split(' ');
    if(!answer||!/[A-Za-z]/.test(answer)||/[\u3400-\u9fff]/.test(answer))return escapeHtml(GENERAL_HINT);
    var pattern=words.slice(0,HINT_WORDS).map(function(word){
      return word.split('').map(function(ch,i){return i===0||!/[A-Za-z]/.test(ch)?ch:'_';}).join('');
    }).join('  ')+(words.length>HINT_WORDS?'  …':'');
    return 'The answer’s first letters: <span class="revision-hint-pattern">'+escapeHtml(pattern)+'</span>';
  }
  // Subjects offered in the Revision menu and the card editor. A class student
  // sees the subjects of their own classes (plus the one open now), not all 33
  // in the catalogue; independent study has no class, so it keeps every subject.
  function subjectChoices(catalog,context,classes,current){
    var keys=Object.keys(catalog||{});
    if(!context||!context.classId)return keys;
    var mine={};
    (classes||[]).concat([context]).forEach(function(item){
      if(!item)return;
      if(item.classSubject)mine[item.classSubject]=true;
      if(item.subject)mine[item.subject]=true;
    });
    if(current)mine[current]=true;
    var picked=keys.filter(function(key){return mine[key];});
    return picked.length?picked:keys;
  }
  function subjectPickerHtml(choices,current){
    if(choices.length<=1)return '<p class="revision-subject-picker">Subject <strong>'+escapeHtml(((root.SUBJECTS||{})[current]||{}).label||'')+'</strong></p>';
    return '<label class="revision-subject-picker" for="revision-subject">Subject <select id="revision-subject">'+choices.map(function(key){return '<option value="'+escapeHtml(key)+'"'+(key===current?' selected':'')+'>'+escapeHtml(root.SUBJECTS[key].label)+'</option>';}).join('')+'</select></label>';
  }
  // Where a card stands, shown on the card so a student can see why it has come
  // back. Same rule as the memory ledger: no review is New, a last rating of
  // "Got it" is Secure, anything else is still Learning.
  var RATING_NAMES={again:'Again',nearly:'Nearly','got-it':'Got it'};
  function cardStatus(review){
    if(!review||!review.lastRating)return {key:'new',label:'New card'};
    if(review.lastRating==='got-it')return {key:'secure',label:'Secure · longer-gap check'};
    return {key:'learning',label:'Learning · last time: '+(RATING_NAMES[review.lastRating]||review.lastRating)};
  }
  // Match pairs: a round of a topic's questions alongside their own answers.
  // No new content: the authored distractors are the ambiguity guard. Two
  // questions share a round only if neither one's answer is offered as an
  // option in the other, since the writers listed every plausible confusion
  // there, so each answer on screen fits exactly one question.
  var MATCH_PAIRS=4,MATCH_STEM_MAX=140,MATCH_ANSWER_MAX=90;
  // Answers that only make sense beside their own options.
  var CONTEXT_ANSWER=/\b(all|none|both|neither) of (the|these|them)\b|\b(above|below)\b/i;
  function matchText(value){return String(value==null?'':value).replace(/\s+/g,' ').trim().toLowerCase();}
  function matchPairs(cards,count,random){
    random=random||Math.random;
    count=count||MATCH_PAIRS;
    var pool=(cards||[]).filter(function(card){
      var q=card&&card.question,answer=q&&q.options&&q.options[q.correct];
      return answer&&!q.type&&String(q.stem||'').length<=MATCH_STEM_MAX&&String(answer).length<=MATCH_ANSWER_MAX&&!CONTEXT_ANSWER.test(answer);
    }).slice();
    for(var i=pool.length-1;i>0;i--){var j=Math.floor(random()*(i+1)),swap=pool[i];pool[i]=pool[j];pool[j]=swap;}
    function answerOf(card){return matchText(card.question.options[card.question.correct]);}
    function optionsOf(card){return Object.keys(card.question.options).map(function(key){return matchText(card.question.options[key]);});}
    var picked=[];
    pool.forEach(function(card){
      if(picked.length>=count)return;
      var answer=answerOf(card),options=optionsOf(card);
      var clash=picked.some(function(other){
        var otherAnswer=answerOf(other);
        return otherAnswer===answer||options.indexOf(otherAnswer)!==-1||optionsOf(other).indexOf(answer)!==-1;
      });
      if(!clash)picked.push(card);
    });
    // Three is still a fair round; fewer is not worth showing.
    return picked.length>=3?picked:[];
  }
  function personalKey(id){return 'personal|'+id;}
  function personalAsReview(card){return {key:personalKey(card.id),bank:card.bank||'personal',personal:true,question:{stem:card.front,options:{answer:card.back},correct:'answer',scaffold:''},source:card.source||null};}
  function cleanPersonalCard(input,existing){
    var front=String(input.front||'').trim(),back=String(input.back||'').trim();
    if(!front||!back||front.length>500||back.length>2000)throw new Error('Add a question and answer (up to 500 and 2,000 characters).');
    return {id:existing&&existing.id||'c-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),front:front,back:back,bank:String(input.bank||'personal').slice(0,120),source:existing&&existing.source||input.source||null,updatedAt:new Date().toISOString()};
  }
  function selectionCount(selected){return (selected||[]).reduce(function(total,id){
    var topic=root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(id)&&root.ForgeChemistryTopics.list().filter(function(item){return item.id===id;})[0];
    return total+(topic?topic.count:Number(((root.BANKS||{})[id]||{}).questionCount||0));
  },0);}
  function assignmentProgress(assignment,state){
    var details=config(assignment),done=state.assignments[String(assignment.id)]||{answered:[]};
    var answered=Array.isArray(done.answered)?done.answered.length:0;
    var total=details&&details.mode==='count'?Math.min(details.target,selectionCount(banks(assignment))||details.target):null;
    return {answered:answered,total:total,complete:!!done.complete||!!(total&&answered>=total)};
  }

  function teacherPanelHtml(subject){
    var subjectInfo=(root.SUBJECTS||{})[subject];
    if(!subjectInfo||!subjectInfo.banks||!subjectInfo.banks.length)return '';
    var choices=subject==='chem'&&root.ForgeChemistryTopics?root.ForgeChemistryTopics.list().map(function(item){return {id:item.id,label:item.label,count:item.count,code:item.code};}):subjectInfo.banks.map(function(bank){var data=(root.BANKS||{})[bank]||{};return {id:bank,label:data.label||bank,count:Number(data.questionCount||0),code:''};});
    var topicRows=choices.map(function(topic,index){return '<label class="revision-topic-choice"><input type="checkbox" value="'+escapeHtml(topic.id)+'"'+(subject!=='chem'&&index<2?' checked':'')+'><span class="revision-topic-swatch revision-tone-'+['ember','blue','gold'][index%3]+'"></span><span><strong>'+escapeHtml(topic.label)+'</strong><small>'+(topic.code?escapeHtml(topic.code)+' · ':'')+topic.count+' curated '+(topic.count===1?'question':'questions')+'</small></span></label>';}).join('');
    return '<section class="teacher-revision-pilot" aria-labelledby="teacher-revision-title"><div class="teacher-revision-intro"><div><h2 id="teacher-revision-title">Set revision</h2><p>Choose completed curriculum content. Forge will choose and schedule each student’s cards.</p></div><span>'+escapeHtml(subjectInfo.label)+'</span></div><div class="teacher-revision-layout"><form id="teacher-revision-form"><fieldset><legend>Choose topics</legend><div class="revision-topic-choices">'+topicRows+'</div></fieldset><fieldset><legend>Set the target</legend><div class="revision-target-choices"><label><input type="radio" name="revision-target" value="10" checked><span><strong>10 cards</strong><small>About 7 minutes</small></span></label><label><input type="radio" name="revision-target" value="20"><span><strong>20 cards</strong><small>About 14 minutes</small></span></label><label><input type="radio" name="revision-target" value="due"><span><strong>Clear due queue</strong><small>Personalised length</small></span></label></div></fieldset><label class="revision-date-label" for="revision-due"><span>Complete by</span><input id="revision-due" type="date" required></label><p class="join-err" id="revision-form-error" role="alert"></p></form><aside class="revision-assignment-preview"><h3>Revision preview</h3><p id="revision-preview-topics">Choose at least one topic</p><dl><div><dt>Target</dt><dd id="revision-preview-target">10 cards</dd></div><div><dt>Students</dt><dd id="revision-preview-students">—</dd></div><div><dt>Due</dt><dd id="revision-preview-date">Choose a date</dd></div></dl><button type="submit" form="teacher-revision-form" class="join-btn">Set revision →</button><small>Students can review these cards across devices. Shared progress appears in the Revision tab after their first review.</small></aside></div></section>';
  }

  function wireTeacherPanel(container,options){
    var form=container&&container.querySelector('#teacher-revision-form');
    if(!form)return;
    var due=form.querySelector('#revision-due');
    var defaultDue=addDays(new Date(),7);due.value=defaultDue.toISOString().slice(0,10);
    function refresh(){
      var selected=Array.prototype.slice.call(form.querySelectorAll('input[type=checkbox]:checked')).map(function(input){return root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(input.value)?root.ForgeChemistryTopics.label(input.value):((root.BANKS||{})[input.value]||{}).label||input.value;});
      var target=form.querySelector('input[name=revision-target]:checked').value;
      container.querySelector('#revision-preview-topics').textContent=selected.length?new Intl.ListFormat('en-GB',{type:'conjunction'}).format(selected):'Choose at least one topic';
      var selectedIds=Array.prototype.slice.call(form.querySelectorAll('input[type=checkbox]:checked')).map(function(input){return input.value;}),count=selectionCount(selectedIds);
      container.querySelector('#revision-preview-target').textContent=target==='due'?'Clear due queue':Math.min(Number(target),count||Number(target))+' cards';
      container.querySelector('#revision-preview-students').textContent=String(options.studentCount||0);
      container.querySelector('#revision-preview-date').textContent=due.value?new Date(due.value+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long'}):'Choose a date';
    }
    form.addEventListener('change',refresh);
    form.addEventListener('submit',function(event){
      event.preventDefault();
      var error=container.querySelector('#revision-form-error');
      var selected=Array.prototype.slice.call(form.querySelectorAll('input[type=checkbox]:checked')).map(function(input){return input.value;});
      var target=form.querySelector('input[name=revision-target]:checked').value;
      if(!selected.length){error.textContent='Choose at least one topic.';error.style.display='block';return;}
      if(!due.value){error.textContent='Choose a due date.';error.style.display='block';return;}
      error.style.display='none';
      var button=form.querySelector('button[type=submit]')||container.querySelector('[form="teacher-revision-form"]');
      if(button){button.disabled=true;button.textContent='Setting revision…';}
      var topicNames=selected.map(function(bank){return root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(bank)?root.ForgeChemistryTopics.label(bank):((root.BANKS||{})[bank]||{}).label||bank;});
      var actualTarget=target==='due'?'due':Math.min(Number(target),selectionCount(selected)||Number(target));
      options.insert({class_id:options.classId,title:'Revision · '+new Intl.ListFormat('en-GB',{type:'conjunction'}).format(topicNames),banks:JSON.stringify(selected.concat(markerFor(actualTarget))),due_date:due.value}).then(function(rows){
        var created=Array.isArray(rows)?rows[0]:rows;
        if(!created||!created.id)throw new Error('No assignment returned');
        if(options.onCreated)options.onCreated(created);
      }).catch(function(){error.textContent='We couldn’t set revision. Check your connection and try again.';error.style.display='block';if(button){button.disabled=false;button.textContent='Set revision →';}});
    });
    refresh();
  }

  function loadStudentData(context){
    var registry=(root.ForgeClasses&&ForgeClasses.list().find(function(item){return item.classId===context.classId;}))||{};
    context=Object.assign({},registry,context);
    var token=root.ForgeAuth&&ForgeAuth.accessToken&&ForgeAuth.accessToken();
    var assignments=token&&context.classId
      ?ForgeAPI.get('assignments','class_id=eq.'+encodeURIComponent(context.classId)+'&order=due_date.asc',{token:token})
      :context.studentId&&context.classCode
        ?ForgeStudentCode.assignments(context.studentId,context.classCode,context.studentCode,context.studentName)
        :Promise.resolve([]);
    return assignments.then(function(payload){return {context:context,assignments:(root.ForgeAssignmentProgress?ForgeAssignmentProgress.rows(payload):Array.isArray(payload)?payload:[]).filter(isRevision)};});
  }

  function mountStudent(options){
    var app=options.root,context=options.context||{},state=readState(context),currentCards=[],currentIndex=0,currentAssignment=null,currentSource='today',ratings=[],editingId=null,lastReviewMessage='';
    var subjectInfo=(root.SUBJECTS||{})[options.subject]||{},subjectBanks=subjectInfo.banks||[];
    var syncStatus=options.syncError?'Saved on this device. Sync will retry when you reconnect or reopen Revision.':root.ForgePersonalCards&&root.ForgePersonalCards.canSync(context)?'Cards and review progress sync with your student record.':'Cards and review progress are saved on this device.';
    if(options.remoteProgress&&root.ForgeRevisionProgress){
      var merged=root.ForgeRevisionProgress.merge(state,options.remoteProgress);
      state.reviews=merged.reviews;state.assignments=merged.assignments;
      writeState(context,state);
    }
    if(Array.isArray(options.remoteCards)){
      Object.keys(state.reviews).forEach(function(key){if(key.indexOf('personal|')===0&&!options.remoteCards.some(function(card){return personalKey(card.id)===key;}))delete state.reviews[key];});
      state.personalCards=options.remoteCards.map(function(card){return {id:card.id,front:card.front,back:card.back,bank:card.bank,source:card.source||null,updatedAt:card.updatedAt};});
      options.remoteCards.forEach(function(card){if(card.review)state.reviews[personalKey(card.id)]=card.review;});
      writeState(context,state);
    }
    var draftKey='forge-revision-draft:'+String(context.studentId||'anonymous');
    function quizReturnUrl(value){
      if(typeof value!=='string'||!/^forge-quiz\.html\?[^#]*$/.test(value))return null;
      return new URLSearchParams(value.slice(value.indexOf('?')+1)).has('bank')?value:null;
    }
    var returnToQuiz=quizReturnUrl(draft()&&draft().returnTo);
    function leaveEditor(){
      clearDraft();
      if(returnToQuiz){root.location.href=returnToQuiz;return;}
      renderHome(options.assignments||[]);
    }
    function topicLabel(bank){return root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(bank)?root.ForgeChemistryTopics.label(bank):TOPICS[bank]?TOPICS[bank].label:(root.BANKS&&root.BANKS[bank]&&root.BANKS[bank].label)||'My cards';}
    function sessionTitle(card){return currentAssignment?'Assigned revision':currentSource==='my-cards'?'My cards':root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(currentSource)?topicLabel(currentSource):card.personal?'My cards':'Today’s revision';}
    function subjectForBank(bank){return Object.keys(root.SUBJECTS||{}).filter(function(key){return (root.SUBJECTS[key].banks||[]).indexOf(bank)!==-1;})[0]||'';}
    function topicOptions(subject,selected){var banks=(root.SUBJECTS&&root.SUBJECTS[subject]&&root.SUBJECTS[subject].banks)||[];if(!banks.length)return '<option value="personal">General</option>';return (selected&&banks.indexOf(selected)===-1?'<option value="'+escapeHtml(selected)+'" selected>'+escapeHtml(topicLabel(selected))+'</option>':'')+banks.map(function(bank){return '<option value="'+escapeHtml(bank)+'"'+(bank===selected?' selected':'')+'>'+escapeHtml(topicLabel(bank))+'</option>';}).join('');}
    function personalCards(){return state.personalCards.map(personalAsReview);}
    function showSyncStatus(message){syncStatus=message;var node=app.querySelector('#revision-card-sync');if(node)node.textContent=message;}
    function syncProgress(cardKey,review,assignmentId,assignment){
      if(!root.ForgeRevisionProgress)return;
      root.ForgeRevisionProgress.save(context,cardKey,review,assignmentId,assignment).catch(function(){
        showSyncStatus('Review saved on this device. Sync will retry when you reconnect or reopen Revision.');
      });
    }
    function cardFor(id){return state.personalCards.filter(function(card){return card.id===id;})[0]||null;}
    function draft(){try{return JSON.parse(localStorage.getItem(draftKey)||'null');}catch(e){return null;}}
    function clearDraft(){try{localStorage.removeItem(draftKey);}catch(e){}}
    function focusHeading(){var heading=app.querySelector('h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}}
    function sessionProgress(){var done=currentIndex,total=currentCards.length;return '<div class="revision-session-progress" role="progressbar" aria-label="Cards reviewed" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+done+'"><i style="--revision-progress:'+Math.round(done/total*100)+'%"></i></div>';}
    function renderError(message){app.innerHTML='<section class="revision-empty"><h1>Revision is unavailable</h1><p>'+escapeHtml(message)+'</p><button type="button" data-revision-action="retry">Try again</button></section>';focusHeading();}
    function renderHome(assignments){
      var cards=options.subject==='chem'?[]:availableCards(subjectBanks),allCards=cards.concat(personalCards()),due=dueCards(allCards,state),unseen=allCards.filter(function(card){return !state.reviews[card.key];});
      var ready=Math.min(8,due.length+unseen.length),nextAssignment=assignments.filter(function(item){return !assignmentProgress(item,state).complete;})[0]||null;
      var assignmentHtml='';
      if(nextAssignment){var progress=assignmentProgress(nextAssignment,state),details=config(nextAssignment),total=progress.total||Math.max(1,dueCards(availableCards(banks(nextAssignment)),state).length),pct=Math.min(100,Math.round(progress.answered/total*100));assignmentHtml='<section class="revision-assignment-band"><div><span>Set by your teacher</span><strong>'+escapeHtml(nextAssignment.title.replace(/^Revision\s*·\s*/,''))+'</strong></div><div><span>'+progress.answered+' of '+(details.mode==='due'?'due queue':total)+' complete</span><div class="revision-progress"><i></i></div></div><div><span>'+(nextAssignment.due_date?'Due '+new Date(nextAssignment.due_date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'}):'No due date')+'</span><button type="button" data-revision-action="assignment" data-assignment-id="'+escapeHtml(nextAssignment.id)+'">'+(progress.answered?'Continue':'Start')+' →</button></div></section>';setTimeout(function(){var bar=app.querySelector('.revision-progress i');if(bar)bar.style.setProperty('--revision-progress',pct+'%');},0);}
      var topicChoices=options.subject==='chem'&&root.ForgeChemistryTopics?root.ForgeChemistryTopics.list().map(function(item){return item.id;}):subjectBanks;
      var topicHtml=topicChoices.map(function(bank,index){var data=(root.BANKS||{})[bank]||{},chem=options.subject==='chem'&&root.ForgeChemistryTopics?root.ForgeChemistryTopics.list().filter(function(item){return item.id===bank;})[0]:null,topic=chem?{label:chem.label,description:chem.code+' · '+chem.count+' curated '+(chem.count===1?'question':'questions'),tone:['ember','blue','gold'][index%3]}:TOPICS[bank]||{label:data.label||bank,description:Number(data.questionCount||0)+' curated questions',tone:['ember','blue','gold'][index%3]},topicCards=availableCards([bank]),topicDue=dueCards(topicCards,state).length,seen=topicCards.filter(function(card){return !!state.reviews[card.key];}).length,mastery=topicCards.length?Math.round(seen/topicCards.length*100):0,masteryStep=Math.min(100,Math.floor(mastery/25)*25),group=chem&&['3.1.1','3.2.1','3.3.1'].indexOf(chem.code)!==-1?'<h3 class="revision-topic-group">'+escapeHtml({'3.1':'Physical chemistry','3.2':'Inorganic chemistry','3.3':'Organic chemistry'}[chem.group]||'Chemistry')+'</h3>':'';return group+'<button class="revision-topic-row" type="button" data-revision-action="topic" data-bank="'+escapeHtml(bank)+'"><span class="revision-topic-swatch revision-tone-'+topic.tone+'"></span><span><strong>'+escapeHtml(topic.label)+'</strong><small>'+escapeHtml(topic.description)+'</small></span><span><b>'+topicDue+'</b> due</span><span class="revision-mastery revision-mastery-'+masteryStep+'"><i></i></span><span aria-hidden="true">→</span></button>';}).join('');
      var allReviews=Object.keys(state.reviews).map(function(key){return state.reviews[key];}),secure=allReviews.filter(function(review){return review.lastRating==='got-it';}).length,learning=allReviews.length-secure;
      var tomorrowStart=new Date();tomorrowStart.setHours(24,0,0,0);
      var dayAfter=new Date(tomorrowStart);dayAfter.setDate(dayAfter.getDate()+1);
      var tomorrow=allCards.filter(function(card){var review=state.reviews[card.key],when=review&&Date.parse(review.dueAt);return Number.isFinite(when)&&when>=tomorrowStart.getTime()&&when<dayAfter.getTime();}).length;
      var later=allCards.filter(function(card){var review=state.reviews[card.key],when=review&&Date.parse(review.dueAt);return Number.isFinite(when)&&when>=dayAfter.getTime();}).length;
      var mine=personalCards(),mineDue=dueCards(mine,state),mineNew=mine.filter(function(card){return !state.reviews[card.key];}),mineReady=mineDue.length+mineNew.length;
      var myRows=state.personalCards.map(function(card){var review=state.reviews[personalKey(card.id)],status=!review?'New':Date.parse(review.dueAt||0)<=Date.now()?'Due':'Scheduled';return '<li class="revision-personal-row"><div><strong>'+escapeHtml(card.front)+'</strong><small>'+escapeHtml(topicLabel(card.bank))+' · '+status+'</small></div><div><button type="button" data-revision-action="edit-card" data-card-id="'+escapeHtml(card.id)+'">Edit</button><button type="button" data-revision-action="confirm-delete" data-card-id="'+escapeHtml(card.id)+'">Delete</button></div></li>';}).join('');
      app.innerHTML='<header class="revision-page-head"><div><h1>Revision</h1>'+subjectPickerHtml(subjectChoices(root.SUBJECTS,options.context,root.ForgeClasses?root.ForgeClasses.list():[],options.subject),options.subject)+'<p>Your next review is chosen from what you have learned and what needs another return.</p></div><div><strong>'+allReviews.length+'</strong><span>'+ (allReviews.length===1?'card':'cards')+' reviewed</span></div></header><section class="revision-today"><div><h2>'+(ready?ready+' '+(ready===1?'card is':'cards are')+' ready to review.':'Your queue is clear for today.')+'</h2><p>'+(ready?'Review due cards and begin a few new ones. Your own cards join the same queue.':'Return when a card is due, or make one from something you learned today.')+'</p>'+(ready?'<button type="button" data-revision-action="today">Start today’s revision →</button>':'')+'</div><div class="revision-return-path"><div><span>Now</span><strong>'+ready+' ready</strong><small>Answer from memory</small></div><i></i><div><span>Tomorrow</span><strong>'+tomorrow+' due</strong><small>Scheduled for tomorrow</small></div><i></i><div><span>Later</span><strong>'+later+' scheduled</strong><small>On future days</small></div></div></section>'+assignmentHtml+'<section class="revision-personal" aria-labelledby="revision-personal-title"><header><div><h2 id="revision-personal-title">My cards</h2><p>Make a question from your notes or save one while practising.</p><p id="revision-card-sync" role="status">'+escapeHtml(syncStatus)+'</p></div><button type="button" data-revision-action="new-card">Create a card</button></header><div class="revision-personal-summary"><span>'+mine.length+' saved</span><span>'+mineReady+' ready today</span><button type="button" data-revision-action="my-cards"'+(mine.length?'':' disabled')+'>Review my cards</button></div>'+(myRows?'<ul class="revision-personal-list">'+myRows+'</ul>':'<p class="revision-personal-empty">No personal cards yet. Start with one question you want to remember.</p>')+'</section>'+(topicChoices.length?'<section class="revision-match-entry" aria-labelledby="revision-match-title"><div><h2 id="revision-match-title">Match pairs</h2><p>Match questions to their answers. Quick practice: it doesn’t change your scores or when cards return.</p></div><div><label for="revision-match-topic" class="forge-visually-hidden">Topic to match</label><select id="revision-match-topic">'+topicChoices.map(function(bank){return '<option value="'+escapeHtml(bank)+'">'+escapeHtml(topicLabel(bank))+'</option>';}).join('')+'</select><button type="button" data-revision-action="match-start">Start matching →</button></div></section>':'')+(subjectBanks.some(function(bank){return !!((root.BANKS||{})[bank]||{}).questions;})?'<section class="revision-topics"><header><div><h2>Browse topics</h2><p>Choose a topic yourself, or let Today mix what is due.</p></div><span>'+escapeHtml(subjectInfo.label||'Subject')+'</span></header><div>'+topicHtml+'</div></section>':'')+'<section class="revision-ledger"><h2>Your memory ledger</h2><div><span>Unseen <b>'+unseen.length+'</b></span><span>Learning <b>'+learning+'</b></span><span>Secure <b>'+secure+'</b></span><span>Due again <b>'+due.length+'</b></span></div></section>';
      if(options.subject==='chem'){
        var title=app.querySelector('.revision-today h2'),description=app.querySelector('.revision-today p'),topics=app.querySelector('.revision-topics header'),ledger=app.querySelector('.revision-ledger');
        if(title&&!ready)title.textContent='Choose a Chemistry topic to practise.';
        if(description)description.textContent=ready?'Your saved cards are ready. For curated Chemistry, choose a topic you have covered below.':'Curated Chemistry questions start only when you choose a topic you have covered below.';
        if(topics){topics.querySelector('h2').textContent='Chemistry topics';topics.querySelector('p').textContent='Pick a topic you have covered. Each set stays within that AQA topic.';}
        if(ledger)ledger.hidden=true;
      }
      focusHeading();
    }
    function selectQueue(selectedBanks,count,dueOnly){
      var all=ordered(availableCards(selectedBanks),context,state),due=dueCards(all,state),unseen=all.filter(function(card){return !state.reviews[card.key];});
      return (dueOnly?due:due.concat(unseen.filter(function(card){return due.indexOf(card)===-1;}))).slice(0,count||8);
    }
    var match=null;
    function renderMatch(bank){
      var pairs=matchPairs(availableCards([bank]));
      if(!pairs.length){
        app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Back to revision">←</button><div><strong>Match pairs</strong><span>'+escapeHtml(topicLabel(bank))+'</span></div></header><section class="revision-empty"><h1>Not enough to match here yet</h1><p>This topic doesn’t have enough short questions with clearly separate answers. Try another topic.</p><button type="button" data-revision-action="home">Back to revision</button></section>';
        return;
      }
      var order=pairs.map(function(_,index){return index;});
      for(var i=order.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),swap=order[i];order[i]=order[j];order[j]=swap;}
      match={bank:bank,pairs:pairs,question:null,answer:null,matched:0,mistakes:0};
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Back to revision">←</button><div><strong>Match pairs</strong><span>'+escapeHtml(topicLabel(bank))+'</span></div></header>'
        +'<section class="revision-match"><p class="revision-match-help">Choose a question, then the answer that goes with it.</p><div class="revision-match-grid">'
        +'<ol class="revision-match-col" aria-label="Questions">'+pairs.map(function(card,index){return '<li><button type="button" class="revision-match-item" data-revision-action="match-pick" data-side="question" data-index="'+index+'" aria-pressed="false">'+escapeHtml(card.question.stem)+'</button></li>';}).join('')+'</ol>'
        +'<ol class="revision-match-col" aria-label="Answers">'+order.map(function(index){var q=pairs[index].question;return '<li><button type="button" class="revision-match-item revision-match-answer" data-revision-action="match-pick" data-side="answer" data-index="'+index+'" aria-pressed="false">'+escapeHtml(q.options[q.correct])+'</button></li>';}).join('')+'</ol>'
        +'</div><p class="revision-match-status" role="status"></p></section>';
    }
    function pickMatch(button){
      if(!match||button.disabled)return;
      var side=button.getAttribute('data-side'),index=Number(button.getAttribute('data-index'));
      app.querySelectorAll('.revision-match-item[data-side="'+side+'"]').forEach(function(item){item.setAttribute('aria-pressed','false');});
      button.setAttribute('aria-pressed','true');
      match[side]=index;
      if(match.question==null||match.answer==null)return;
      var status=app.querySelector('.revision-match-status'),chosen=app.querySelectorAll('.revision-match-item[aria-pressed="true"]');
      if(match.question===match.answer){
        match.matched++;
        chosen.forEach(function(item){item.setAttribute('aria-pressed','false');item.classList.add('is-matched');item.disabled=true;});
        var left=match.pairs.length-match.matched;status.textContent=left?'Matched. '+left+' to go.':'All matched.';
      } else {
        match.mistakes++;
        chosen.forEach(function(item){item.setAttribute('aria-pressed','false');item.classList.add('is-wrong');setTimeout(function(){item.classList.remove('is-wrong');},650);});
        status.textContent='Not a pair. Try again.';
      }
      match.question=null;match.answer=null;
      if(match.matched===match.pairs.length){
        var bank=match.bank,mistakes=match.mistakes,total=match.pairs.length;
        app.querySelector('.revision-match').insertAdjacentHTML('beforeend','<div class="revision-match-done"><h2>All '+total+' matched.</h2><p>'+(mistakes?mistakes+' wrong '+(mistakes===1?'pair':'pairs')+' on the way.':'No wrong pairs.')+'</p><div><button type="button" data-revision-action="match-again" data-bank="'+escapeHtml(bank)+'">Match another set →</button><button type="button" data-revision-action="home">Back to revision</button></div></div>');
        var again=app.querySelector('[data-revision-action="match-again"]');if(again)again.focus();
        match=null;
      }
    }
    function start(cards,assignment,source){
      currentCards=cards;currentIndex=0;currentAssignment=assignment||null;currentSource=source||'today';ratings=[];lastReviewMessage='';
      if(!cards.length){if(assignment&&config(assignment).mode==='due'){var record=state.assignments[String(assignment.id)]||{answered:[]};record.complete=true;record.updatedAt=new Date().toISOString();state.assignments[String(assignment.id)]=record;writeState(context,state);syncProgress(null,null,String(assignment.id),record);}renderHome(options.assignments||[]);return;}
      renderCard();
    }
    function renderEditor(card){
      editingId=card&&card.id||null;
      var defaultBanks=subjectBanks;
      var selected=card&&card.bank||defaultBanks[0]||'personal';
      var chosenSubject=selected==='personal'?'':subjectForBank(selected)||options.subject,editorSubjects=subjectChoices(root.SUBJECTS,options.context,root.ForgeClasses?root.ForgeClasses.list():[],options.subject);
      // An existing card keeps its subject even if it is outside the student's classes.
      if(chosenSubject&&editorSubjects.indexOf(chosenSubject)===-1&&(root.SUBJECTS||{})[chosenSubject])editorSubjects=editorSubjects.concat(chosenSubject);
      var subjectSelect='<option value=""'+(chosenSubject?'':' selected')+'>General / no subject</option>'+editorSubjects.map(function(key){return '<option value="'+escapeHtml(key)+'"'+(key===chosenSubject?' selected':'')+'>'+escapeHtml(root.SUBJECTS[key].label)+'</option>';}).join('');
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="'+(returnToQuiz?'Back to quiz':'Back to revision')+'">←</button><div><strong>'+ (editingId?'Edit card':'Create a card')+'</strong></div></header><form class="revision-editor" id="revision-card-form"><h1>'+(editingId?'Edit your card':'Make a flashcard')+'</h1><p>Write a question you can answer without seeing the back.</p><label for="revision-card-front">Question</label><textarea id="revision-card-front" name="front" maxlength="500" required rows="3" placeholder="What do I need to recall?">'+escapeHtml(card&&card.front||'')+'</textarea><label for="revision-card-back">Answer</label><textarea id="revision-card-back" name="back" maxlength="2000" required rows="5" placeholder="Write the answer in your own words…">'+escapeHtml(card&&card.back||'')+'</textarea><div class="revision-editor-topic"><div><label for="revision-card-subject">Subject</label><select id="revision-card-subject" name="subject">'+subjectSelect+'</select></div><div><label for="revision-card-topic">Topic</label><select id="revision-card-topic" name="bank">'+topicOptions(chosenSubject,selected)+'</select></div></div>'+(card&&card.source?'<p class="revision-card-source">Started from a Forge question. Check that the question makes sense without answer choices.</p>':'')+'<p id="revision-card-error" class="revision-card-error" role="alert" hidden></p><div class="revision-editor-actions"><button type="button" data-revision-action="home">'+(returnToQuiz?'Back to quiz':'Cancel')+'</button><button type="submit">'+(returnToQuiz?'Save and return to quiz':'Save card')+'</button></div></form>';
      focusHeading();
    }
    function showEditor(id){if(!id)clearDraft();renderEditor(id?cardFor(id):null);}
    function saveCard(event){
      event.preventDefault();var form=event.target,error=app.querySelector('#revision-card-error'),old=editingId?cardFor(editingId):null,card;
      try{card=cleanPersonalCard({front:form.elements.front.value,back:form.elements.back.value,bank:form.elements.bank.value,source:draft()&&draft().source},old);}catch(e){error.textContent=e.message;error.hidden=false;return;}
      var previousCards=state.personalCards;
      if(old){state.personalCards=state.personalCards.map(function(item){return item.id===old.id?card:item;});}else state.personalCards=[card].concat(state.personalCards);
      if(!writeState(context,state)){
        state.personalCards=previousCards;
        error.textContent='This card could not be saved on this device. Check your browser storage and try again.';
        error.hidden=false;
        return;
      }
      clearDraft();
      if(root.ForgePersonalCards)root.ForgePersonalCards.save(context,card,state.reviews[personalKey(card.id)]||null).catch(function(){showSyncStatus('Saved on this device. Account sync will retry next time you open Revision.');});
      if(returnToQuiz){root.location.href=returnToQuiz;return;}
      renderHome(options.assignments||[]);
    }
    function deleteCard(id){var card=cardFor(id);if(!card)return;state.personalCards=state.personalCards.filter(function(item){return item.id!==id;});delete state.reviews[personalKey(id)];writeState(context,state);renderHome(options.assignments||[]);if(root.ForgePersonalCards)root.ForgePersonalCards.remove(context,id).catch(function(){showSyncStatus('Deleted on this device. Account sync will retry next time you open Revision.');});}
    function renderCard(){
      var card=currentCards[currentIndex],question=card.question;
      var choices=card.personal?'':Object.keys(question.options||{}).map(function(key){return '<li><label class="revision-choice-option"><input type="radio" name="revision-choice" value="'+escapeHtml(key)+'" data-revision-choice="'+escapeHtml(key)+'" aria-label="'+escapeHtml(key+' '+question.options[key])+'"><b>'+escapeHtml(key)+'</b><span>'+escapeHtml(question.options[key])+'</span></label></li>';}).join('');
      var notice=lastReviewMessage?'<p class="revision-schedule-note" role="status">'+escapeHtml(lastReviewMessage)+'</p>':'';
      lastReviewMessage='';
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Leave revision">←</button><div><strong>'+escapeHtml(sessionTitle(card))+'</strong><span>Card '+(currentIndex+1)+' of '+currentCards.length+'</span></div></header>'+notice+sessionProgress()+'<article class="revision-recall-card"><div><span>'+escapeHtml(root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(currentSource)?topicLabel(currentSource):topicLabel(card.bank))+'</span><span class="revision-card-status revision-card-status--'+cardStatus(state.reviews[card.key]).key+'">'+escapeHtml(cardStatus(state.reviews[card.key]).label)+'</span></div><h1>'+escapeHtml(question.stem)+'</h1><p>Compare your answer with '+(card.personal?'the answer you saved':'Forge’s curated answer')+'.</p><label for="revision-answer">Your answer</label><textarea id="revision-answer" rows="4" placeholder="Type what you can remember…"></textarea><div class="revision-card-actions">'+(card.personal?'':'<button type="button" data-revision-action="hint">Help me start</button><button type="button" data-revision-action="choices">Show choices</button>')+'<button type="button" data-revision-action="reveal">Check answer →</button></div>'+(card.personal?'':'<p class="revision-hint" hidden><strong>Try this</strong> '+hintHtml(question)+'</p><div class="revision-choice-help" hidden><p>Choose one to put it in your answer, then check it.</p><ol class="revision-choices">'+choices+'</ol><p class="revision-choice-status" role="status" hidden></p></div>')+'</article>';
      focusHeading();setTimeout(function(){var answer=app.querySelector('#revision-answer');if(answer)answer.focus();},80);
    }
    function reveal(){
      var card=currentCards[currentIndex],answer=app.querySelector('#revision-answer'),written=answer&&answer.value.trim();
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Leave revision">←</button><div><strong>'+escapeHtml(sessionTitle(card))+'</strong><span>Card '+(currentIndex+1)+' of '+currentCards.length+'</span></div></header>'+sessionProgress()+'<article class="revision-review-card"><h1>'+escapeHtml(card.question.stem)+'</h1><span class="revision-review-topic">'+escapeHtml(root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(currentSource)?topicLabel(currentSource):topicLabel(card.bank))+'</span><section><span>Your answer</span><p>'+escapeHtml(written||'No answer entered — use the answer to rebuild this idea.')+'</p></section><section class="revision-answer-reveal"><span>'+(card.personal?'Your saved answer':'What a secure answer includes')+'</span><p>'+escapeHtml(modelAnswer(card.question))+'</p><small>'+escapeHtml(card.question.scaffold||'')+'</small></section><footer><div><strong>How well did you know it?</strong><span>Your choice sets when this card returns.</span></div><div><button type="button" data-revision-rating="again"><strong>Again</strong><small>Later today</small></button><button type="button" data-revision-rating="nearly"><strong>Nearly</strong><small>Tomorrow</small></button><button type="button" data-revision-rating="got-it"><strong>Got it</strong><small>In 7+ days</small></button></div></footer></article>';
      focusHeading();
    }
    function rate(rating){
      var card=currentCards[currentIndex],previous=state.reviews[card.key]||{};
      state.reviews[card.key]={lastRating:rating,dueAt:nextDue(rating,previous).toISOString(),secureReviews:rating==='got-it'?(previous.secureReviews||0)+1:0,updatedAt:new Date().toISOString()};
      if(!card.personal)syncReview(context,card,rating,state.reviews[card.key].dueAt,currentAssignment);
      if(card.personal&&root.ForgePersonalCards){var own=cardFor(card.key.slice(9));if(own)root.ForgePersonalCards.save(context,own,state.reviews[card.key]).catch(function(){});}
      ratings.push(rating);
      lastReviewMessage=rating==='again'?'Previous card returns later today.':rating==='nearly'?'Previous card returns tomorrow.':'Previous card is set for a longer gap.';
      if(currentAssignment){var id=String(currentAssignment.id),record=state.assignments[id]||{answered:[]};if(record.answered.indexOf(card.key)===-1)record.answered.push(card.key);var details=config(currentAssignment),target=Math.min(details.target,selectionCount(banks(currentAssignment))||details.target);record.complete=details.mode==='count'?record.answered.length>=target:currentIndex>=currentCards.length-1;record.updatedAt=new Date().toISOString();state.assignments[id]=record;}
      writeState(context,state);
      if(!card.personal)syncProgress(card.key,state.reviews[card.key],currentAssignment&&String(currentAssignment.id),currentAssignment&&state.assignments[String(currentAssignment.id)]);
      if(currentIndex<currentCards.length-1){currentIndex++;renderCard();}else renderResult();
    }
    function renderResult(){
      var moved=ratings.filter(function(rating){return rating==='got-it';}).length,sooner=ratings.length-moved;
      var repeatOwn=currentSource==='my-cards',repeatTopic=root.ForgeChemistryTopics&&root.ForgeChemistryTopics.pointId(currentSource);
      var dates=currentCards.map(function(card){return Date.parse(state.reviews[card.key]&&state.reviews[card.key].dueAt||'');}).filter(Number.isFinite);
      var nextAt=dates.length?Math.min.apply(null,dates):null;
      var nextDate=nextAt&&new Date(nextAt),now=new Date();
      var nextLabel=nextDate&&nextDate.toDateString()===now.toDateString()?'later today':nextDate?nextDate.toLocaleDateString('en-GB',{day:'numeric',month:'long'}):'when you next open Revision';
      app.innerHTML='<section class="revision-result"><span aria-hidden="true">✓</span><h1>'+ratings.length+' '+(ratings.length===1?'card':'cards')+' reviewed.</h1><p>'+moved+' '+(moved===1?'card is':'cards are')+' set for a longer gap. '+sooner+' '+(sooner===1?'card will':'cards will')+' return sooner for another try.</p><dl><div><dt>Longer gap</dt><dd>'+moved+' '+(moved===1?'card':'cards')+'</dd></div><div><dt>Returns sooner</dt><dd>'+sooner+' '+(sooner===1?'card':'cards')+'</dd></div><div><dt>Reviewed</dt><dd>'+ratings.length+' '+(ratings.length===1?'card':'cards')+'</dd></div></dl><p class="revision-next-return">Next card returns '+nextLabel+'.</p><div><button type="button" data-revision-action="'+(repeatOwn?'my-cards':repeatTopic?'topic':'today')+'"'+(repeatTopic?' data-bank="'+escapeHtml(currentSource)+'"':'')+'>'+ (repeatOwn?'Review my cards again':repeatTopic?'Review this topic again':'Review another set')+'</button><button type="button" data-revision-action="home">Back to Revision</button></div></section>';
      focusHeading();
    }
    app.addEventListener('submit',function(event){if(event.target.id==='revision-card-form')saveCard(event);});
    app.addEventListener('change',function(event){
      if(event.target.id==='revision-subject'){options.changeSubject(event.target.value);return;}
      if(event.target.id==='revision-card-subject'){var topic=app.querySelector('#revision-card-topic');if(topic)topic.innerHTML=topicOptions(event.target.value);return;}
      if(event.target.matches('[data-revision-choice]')){
        var key=event.target.value,card=currentCards[currentIndex],answer=app.querySelector('#revision-answer');
        if(!card||!answer||!Object.prototype.hasOwnProperty.call(card.question.options||{},key))return;
        answer.value=card.question.options[key];
        var status=app.querySelector('.revision-choice-status');if(status){status.textContent='Choice '+key+' added to your answer.';status.hidden=false;}
      }
    });
    app.addEventListener('click',function(event){
      var rating=event.target.closest('[data-revision-rating]');if(rating){rate(rating.getAttribute('data-revision-rating'));return;}
      var action=event.target.closest('[data-revision-action]');if(!action)return;
      var name=action.getAttribute('data-revision-action');
      if(name==='home'){if(app.querySelector('#revision-card-form'))leaveEditor();else renderHome(options.assignments||[]);}
      if(name==='retry')options.reload();
      if(name==='hint'){var hint=app.querySelector('.revision-hint');if(hint)hint.hidden=false;action.hidden=true;}
      if(name==='choices'){var choices=app.querySelector('.revision-choice-help');if(choices)choices.hidden=false;action.hidden=true;}
      if(name==='reveal')reveal();
      if(name==='today'){var mix=ordered(availableCards(options.subject==='chem'?[]:subjectBanks).concat(personalCards()),context,state),dueNow=dueCards(mix,state),newCards=mix.filter(function(card){return !state.reviews[card.key];});start(dueNow.concat(newCards).slice(0,8));}
      if(name==='my-cards')start(ordered(personalCards(),context,state).slice(0,8),null,'my-cards');
      if(name==='new-card')showEditor();
      if(name==='edit-card')showEditor(action.getAttribute('data-card-id'));
      if(name==='confirm-delete'){var id=action.getAttribute('data-card-id'),row=action.closest('.revision-personal-row');if(row){row.querySelector('div:last-child').innerHTML='<span class="revision-delete-question">Delete this card?</span><button type="button" data-revision-action="cancel-delete">Cancel</button><button type="button" data-revision-action="delete-card" data-card-id="'+escapeHtml(id)+'">Delete card</button>';}}
      if(name==='cancel-delete')renderHome(options.assignments||[]);
      if(name==='delete-card')deleteCard(action.getAttribute('data-card-id'));
      if(name==='match-start'){var picker=app.querySelector('#revision-match-topic');if(picker)renderMatch(picker.value);}
      if(name==='match-again')renderMatch(action.getAttribute('data-bank'));
      if(name==='match-pick')pickMatch(action);
      if(name==='topic'){var selectedTopic=action.getAttribute('data-bank');start(selectQueue([selectedTopic],8,false),null,selectedTopic);}
      if(name==='assignment'){var assignment=(options.assignments||[]).filter(function(item){return String(item.id)===action.getAttribute('data-assignment-id');})[0];if(assignment){var details=config(assignment),progress=assignmentProgress(assignment,state),record=state.assignments[String(assignment.id)]||{answered:[]},remaining=details.mode==='count'?Math.max(0,details.target-progress.answered):20,queue=selectQueue(banks(assignment),remaining,details.mode==='due').filter(function(card){return record.answered.indexOf(card.key)===-1;});start(queue,assignment);}}
    });
    if(root.addEventListener&&root.ForgeRevisionProgress){root.addEventListener('online',function(){
      root.ForgeRevisionProgress.load(context,state,(options.assignments||[]).map(function(item){return String(item.id);})).then(function(remote){
        if(!remote)return;
        var merged=root.ForgeRevisionProgress.merge(state,remote);
        state.reviews=merged.reviews;state.assignments=merged.assignments;
        writeState(context,state);
        showSyncStatus('Cards and review progress sync with your student record.');
        if(app.querySelector('.revision-page-head'))renderHome(options.assignments||[]);
      }).catch(function(){showSyncStatus('Review saved on this device. Sync will retry when you reopen Revision.');});
    });}
    var pending=draft();
    if(pending)renderEditor(pending);else renderHome(options.assignments||[]);
  }

  root.ForgeRevision={TOPICS:TOPICS,config:config,banks:banks,isRevision:isRevision,markerFor:markerFor,assignmentProgress:assignmentProgress,readState:readState,cleanPersonalCard:cleanPersonalCard,personalAsReview:personalAsReview,hintHtml:hintHtml,matchPairs:matchPairs,cardStatus:cardStatus,subjectChoices:subjectChoices,teacherPanelHtml:teacherPanelHtml,wireTeacherPanel:wireTeacherPanel,loadStudentData:loadStudentData,mountStudent:mountStudent};
})(window);
