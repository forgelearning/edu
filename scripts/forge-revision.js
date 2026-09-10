/* Forge Revision pilot — curated retrieval practice for Year 10 GCSE Geography.
 * Assignment metadata is carried by a reserved entry in assignments.banks so
 * the pilot can use the existing, class-scoped assignment pipeline without a
 * production schema change. Review schedules stay private to this device. */
(function(root){
  var PILOT_BANKS=['GCSE-GEO-HAZ','GCSE-GEO-BIOSPHERE','GCSE-GEO-DEV'];
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
    try{return JSON.parse(localStorage.getItem(storageKey(context))||'{"reviews":{},"assignments":{}}');}
    catch(e){return {reviews:{},assignments:{}};}
  }
  function writeState(context,state){try{localStorage.setItem(storageKey(context),JSON.stringify(state));}catch(e){}}
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
    (selectedBanks||PILOT_BANKS).forEach(function(bank){
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
  function assignmentProgress(assignment,state){
    var details=config(assignment),done=state.assignments[String(assignment.id)]||{answered:[]};
    var answered=Array.isArray(done.answered)?done.answered.length:0;
    return {answered:answered,total:details&&details.mode==='count'?details.target:null,complete:!!done.complete};
  }

  function teacherPanelHtml(subject){
    if(subject!=='gcse-geo')return '';
    var topicRows=PILOT_BANKS.map(function(bank,index){var topic=TOPICS[bank],data=(root.BANKS||{})[bank]||{};return '<label class="revision-topic-choice"><input type="checkbox" value="'+bank+'"'+(index<2?' checked':'')+'><span class="revision-topic-swatch revision-tone-'+topic.tone+'"></span><span><strong>'+topic.label+'</strong><small>'+Number(data.questionCount||0)+' curated questions</small></span></label>';}).join('');
    return '<section class="teacher-revision-pilot" aria-labelledby="teacher-revision-title"><div class="teacher-revision-intro"><div><h2 id="teacher-revision-title">Set revision</h2><p>Choose completed curriculum content. Forge will choose and schedule each student’s cards.</p></div><span>Year 10 Geography pilot</span></div><div class="teacher-revision-layout"><form id="teacher-revision-form"><fieldset><legend>Choose topics</legend><div class="revision-topic-choices">'+topicRows+'</div></fieldset><fieldset><legend>Set the target</legend><div class="revision-target-choices"><label><input type="radio" name="revision-target" value="10" checked><span><strong>10 cards</strong><small>About 7 minutes</small></span></label><label><input type="radio" name="revision-target" value="20"><span><strong>20 cards</strong><small>About 14 minutes</small></span></label><label><input type="radio" name="revision-target" value="due"><span><strong>Clear due queue</strong><small>Personalised length</small></span></label></div></fieldset><label class="revision-date-label" for="revision-due"><span>Complete by</span><input id="revision-due" type="date" required></label><p class="join-err" id="revision-form-error" role="alert"></p></form><aside class="revision-assignment-preview"><h3>Revision preview</h3><p id="revision-preview-topics">Hazardous Earth and People and the Biosphere</p><dl><div><dt>Target</dt><dd id="revision-preview-target">10 cards</dd></div><div><dt>Students</dt><dd id="revision-preview-students">—</dd></div><div><dt>Due</dt><dd id="revision-preview-date">Choose a date</dd></div></dl><button type="submit" form="teacher-revision-form" class="join-btn">Set revision →</button><small>Individual schedules stay on each student’s device. Shared progress appears in the Revision tab after their first review.</small></aside></div></section>';
  }

  function wireTeacherPanel(container,options){
    var form=container&&container.querySelector('#teacher-revision-form');
    if(!form)return;
    var due=form.querySelector('#revision-due');
    var defaultDue=addDays(new Date(),7);due.value=defaultDue.toISOString().slice(0,10);
    function refresh(){
      var selected=Array.prototype.slice.call(form.querySelectorAll('input[type=checkbox]:checked')).map(function(input){return TOPICS[input.value].label;});
      var target=form.querySelector('input[name=revision-target]:checked').value;
      container.querySelector('#revision-preview-topics').textContent=selected.length?new Intl.ListFormat('en-GB',{type:'conjunction'}).format(selected):'Choose at least one topic';
      container.querySelector('#revision-preview-target').textContent=target==='due'?'Clear due queue':target+' cards';
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
      var topicNames=selected.map(function(bank){return TOPICS[bank].label;});
      options.insert({class_id:options.classId,title:'Revision · '+new Intl.ListFormat('en-GB',{type:'conjunction'}).format(topicNames),banks:JSON.stringify(selected.concat(markerFor(target))),due_date:due.value}).then(function(rows){
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
    var assignments=context.studentId&&context.classCode
      ?ForgeStudentCode.assignments(context.studentId,context.classCode,context.studentCode,context.studentName)
      :root.ForgeAuth&&ForgeAuth.accessToken()&&context.classId
        ?ForgeAPI.get('assignments','class_id=eq.'+encodeURIComponent(context.classId)+'&order=due_date.asc',{token:ForgeAuth.accessToken()})
        :Promise.resolve([]);
    return assignments.then(function(payload){return {context:context,assignments:(root.ForgeAssignmentProgress?ForgeAssignmentProgress.rows(payload):Array.isArray(payload)?payload:[]).filter(isRevision)};});
  }

  function mountStudent(options){
    var app=options.root,context=options.context||{},state=readState(context),currentCards=[],currentIndex=0,currentAssignment=null,ratings=[];
    function focusHeading(){var heading=app.querySelector('h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}}
    function renderError(message){app.innerHTML='<section class="revision-empty"><h1>Revision is unavailable</h1><p>'+escapeHtml(message)+'</p><button type="button" data-revision-action="retry">Try again</button></section>';focusHeading();}
    function renderHome(assignments){
      var cards=availableCards(),due=dueCards(cards,state),unseen=cards.filter(function(card){return !state.reviews[card.key];});
      var ready=due.length||Math.min(8,unseen.length),nextAssignment=assignments.filter(function(item){return !assignmentProgress(item,state).complete;})[0]||null;
      var assignmentHtml='';
      if(nextAssignment){var progress=assignmentProgress(nextAssignment,state),details=config(nextAssignment),total=progress.total||Math.max(1,dueCards(availableCards(banks(nextAssignment)),state).length),pct=Math.min(100,Math.round(progress.answered/total*100));assignmentHtml='<section class="revision-assignment-band"><div><span>Set by your teacher</span><strong>'+escapeHtml(nextAssignment.title.replace(/^Revision\s*·\s*/,''))+'</strong></div><div><span>'+progress.answered+' of '+(details.mode==='due'?'due queue':details.target)+' complete</span><div class="revision-progress"><i></i></div></div><div><span>'+(nextAssignment.due_date?'Due '+new Date(nextAssignment.due_date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'}):'No due date')+'</span><button type="button" data-revision-action="assignment" data-assignment-id="'+escapeHtml(nextAssignment.id)+'">'+(progress.answered?'Continue':'Start')+' →</button></div></section>';setTimeout(function(){var bar=app.querySelector('.revision-progress i');if(bar)bar.style.setProperty('--revision-progress',pct+'%');},0);}
      var topicHtml=PILOT_BANKS.map(function(bank){var topic=TOPICS[bank],topicCards=availableCards([bank]),topicDue=dueCards(topicCards,state).length,seen=topicCards.filter(function(card){return !!state.reviews[card.key];}).length,mastery=topicCards.length?Math.round(seen/topicCards.length*100):0,masteryStep=Math.min(100,Math.floor(mastery/25)*25);return '<button class="revision-topic-row" type="button" data-revision-action="topic" data-bank="'+bank+'"><span class="revision-topic-swatch revision-tone-'+topic.tone+'"></span><span><strong>'+topic.label+'</strong><small>'+topic.description+'</small></span><span><b>'+topicDue+'</b> due</span><span class="revision-mastery revision-mastery-'+masteryStep+'"><i></i></span><span aria-hidden="true">→</span></button>';}).join('');
      var allReviews=Object.keys(state.reviews).map(function(key){return state.reviews[key];}),secure=allReviews.filter(function(review){return review.lastRating==='got-it';}).length,learning=allReviews.length-secure;
      app.innerHTML='<header class="revision-page-head"><div><h1>Revision</h1><p>Your next review is chosen from what you have learned and what needs another return.</p></div><div><strong>'+allReviews.length+'</strong><span>cards reviewed<br>on this device</span></div></header><section class="revision-today"><div><h2>'+(ready?ready+' cards are ready to come back.':'Your queue is clear for today.')+'</h2><p>'+(ready?'Forge has mixed due knowledge with a small amount of completed Year 9 content.':'Return tomorrow and Forge will bring back the right knowledge at the right time.')+'</p>'+(ready?'<button type="button" data-revision-action="today">Start today’s revision →</button>':'')+'</div><div class="revision-return-path"><div><span>Now</span><strong>'+ready+' ready</strong><small>Answer from memory</small></div><i></i><div><span>Tomorrow</span><strong>'+learning+' learning</strong><small>Anything uncertain</small></div><i></i><div><span>Later</span><strong>'+secure+' secure</strong><small>If recall holds</small></div></div></section>'+assignmentHtml+'<section class="revision-topics"><header><div><h2>Browse the pilot topics</h2><p>Choose a topic yourself, or let Today mix what is due.</p></div><span>Year 10 Geography pilot</span></header><div>'+topicHtml+'</div></section><section class="revision-ledger"><h2>Your memory ledger</h2><div><span>Unseen <b>'+unseen.length+'</b></span><span>Learning <b>'+learning+'</b></span><span>Secure <b>'+secure+'</b></span><span>Due again <b>'+due.length+'</b></span></div></section>';
      focusHeading();
    }
    function selectQueue(selectedBanks,count,dueOnly){
      var all=ordered(availableCards(selectedBanks),context,state),due=dueCards(all,state),unseen=all.filter(function(card){return !state.reviews[card.key];});
      return (dueOnly?due:due.concat(unseen.filter(function(card){return due.indexOf(card)===-1;}))).slice(0,count||8);
    }
    function start(cards,assignment){
      currentCards=cards;currentIndex=0;currentAssignment=assignment||null;ratings=[];
      if(!cards.length){if(assignment&&config(assignment).mode==='due'){var record=state.assignments[String(assignment.id)]||{answered:[]};record.complete=true;state.assignments[String(assignment.id)]=record;writeState(context,state);}renderHome(options.assignments||[]);return;}
      renderCard();
    }
    function renderCard(){
      var card=currentCards[currentIndex],question=card.question;
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Leave revision">←</button><div><strong>'+(currentAssignment?'Assigned revision':'Today’s revision')+'</strong><span>Card '+(currentIndex+1)+' of '+currentCards.length+'</span></div></header><div class="revision-session-progress"><i></i></div><article class="revision-recall-card"><div><span>'+escapeHtml(TOPICS[card.bank].label)+'</span><span>Answer from memory</span></div><h1>'+escapeHtml(question.stem)+'</h1><p>One precise sentence is enough. You will compare it with Forge’s curated answer.</p><label for="revision-answer">Your answer</label><textarea id="revision-answer" rows="4" placeholder="Type what you can remember…"></textarea><div class="revision-card-actions"><button type="button" data-revision-action="hint">Give me a clue</button><button type="button" data-revision-action="reveal">Check answer →</button></div><p class="revision-hint" hidden>'+escapeHtml(question.scaffold||'Think about the exact geographical process or relationship.')+'</p></article>';
      var progress=app.querySelector('.revision-session-progress i');if(progress)progress.style.setProperty('--revision-progress',Math.round((currentIndex+1)/currentCards.length*100)+'%');
      focusHeading();setTimeout(function(){var answer=app.querySelector('#revision-answer');if(answer)answer.focus();},80);
    }
    function reveal(){
      var card=currentCards[currentIndex],answer=app.querySelector('#revision-answer'),written=answer&&answer.value.trim();
      app.innerHTML='<header class="revision-session-head"><button type="button" data-revision-action="home" aria-label="Leave revision">←</button><div><strong>'+(currentAssignment?'Assigned revision':'Today’s revision')+'</strong><span>Card '+(currentIndex+1)+' of '+currentCards.length+'</span></div></header><article class="revision-review-card"><h1>'+escapeHtml(card.question.stem)+'</h1><span class="revision-review-topic">'+escapeHtml(TOPICS[card.bank].label)+'</span><section><span>Your answer</span><p>'+escapeHtml(written||'No answer entered — use the model to rebuild this idea.')+'</p></section><section><span>What a secure answer includes</span><p>'+escapeHtml(modelAnswer(card.question))+'</p><small>'+escapeHtml(card.question.scaffold||'')+'</small></section><footer><div><strong>How well did you know it?</strong><span>Your choice sets when this card returns.</span></div><div><button type="button" data-revision-rating="again"><strong>Again</strong><small>Later today</small></button><button type="button" data-revision-rating="nearly"><strong>Nearly</strong><small>Tomorrow</small></button><button type="button" data-revision-rating="got-it"><strong>Got it</strong><small>In 7+ days</small></button></div></footer></article>';
      focusHeading();
    }
    function rate(rating){
      var card=currentCards[currentIndex],previous=state.reviews[card.key]||{};
      state.reviews[card.key]={lastRating:rating,dueAt:nextDue(rating,previous).toISOString(),secureReviews:rating==='got-it'?(previous.secureReviews||0)+1:0,updatedAt:new Date().toISOString()};
      syncReview(context,card,rating,state.reviews[card.key].dueAt,currentAssignment);
      ratings.push(rating);
      if(currentAssignment){var id=String(currentAssignment.id),record=state.assignments[id]||{answered:[]};if(record.answered.indexOf(card.key)===-1)record.answered.push(card.key);var details=config(currentAssignment);record.complete=details.mode==='count'?record.answered.length>=details.target:currentIndex>=currentCards.length-1;state.assignments[id]=record;}
      writeState(context,state);
      if(currentIndex<currentCards.length-1){currentIndex++;renderCard();}else renderResult();
    }
    function renderResult(){var moved=ratings.filter(function(rating){return rating==='got-it';}).length,sooner=ratings.length-moved;app.innerHTML='<section class="revision-result"><span>✓</span><h1>That review moved your knowledge forward.</h1><p>'+moved+' '+(moved===1?'card is':'cards are')+' ready for a longer gap. '+sooner+' '+(sooner===1?'card will':'cards will')+' return sooner while the knowledge is still forming.</p><dl><div><dt>Moved forward</dt><dd>'+moved+' cards</dd></div><div><dt>Returns sooner</dt><dd>'+sooner+' cards</dd></div><div><dt>Reviewed</dt><dd>'+ratings.length+' cards</dd></div></dl><div><button type="button" data-revision-action="today">Review another set</button><button type="button" data-revision-action="home">Back to Revision</button></div></section>';focusHeading();}
    app.addEventListener('click',function(event){
      var rating=event.target.closest('[data-revision-rating]');if(rating){rate(rating.getAttribute('data-revision-rating'));return;}
      var action=event.target.closest('[data-revision-action]');if(!action)return;
      var name=action.getAttribute('data-revision-action');
      if(name==='home')renderHome(options.assignments||[]);
      if(name==='retry')options.reload();
      if(name==='hint'){var hint=app.querySelector('.revision-hint');if(hint)hint.hidden=false;}
      if(name==='reveal')reveal();
      if(name==='today')start(selectQueue(PILOT_BANKS,8,false));
      if(name==='topic')start(selectQueue([action.getAttribute('data-bank')],8,false));
      if(name==='assignment'){var assignment=(options.assignments||[]).filter(function(item){return String(item.id)===action.getAttribute('data-assignment-id');})[0];if(assignment){var details=config(assignment),progress=assignmentProgress(assignment,state),record=state.assignments[String(assignment.id)]||{answered:[]},remaining=details.mode==='count'?Math.max(0,details.target-progress.answered):20,queue=selectQueue(banks(assignment),remaining,details.mode==='due').filter(function(card){return record.answered.indexOf(card.key)===-1;});start(queue,assignment);}}
    });
    renderHome(options.assignments||[]);
  }

  root.ForgeRevision={PILOT_BANKS:PILOT_BANKS,TOPICS:TOPICS,config:config,banks:banks,isRevision:isRevision,markerFor:markerFor,assignmentProgress:assignmentProgress,readState:readState,teacherPanelHtml:teacherPanelHtml,wireTeacherPanel:wireTeacherPanel,loadStudentData:loadStudentData,mountStudent:mountStudent};
})(window);
