const screens=[...document.querySelectorAll('.screen')];
const roleButtons=[...document.querySelectorAll('[data-role]')];
const toast=document.getElementById('toast');
const questions=[
  {topic:'People and the Biosphere',kind:'Explain the difference',question:'Why can a tropical rainforest and a hot desert exist at similar latitudes?',why:'You repaired this misconception in Anvil three days ago. Today checks whether the distinction held.',hint:'Think about rainfall amount and seasonality, not latitude alone.',model:'Latitude helps explain temperature, but global atmospheric circulation creates very different rainfall totals and seasonal patterns.'},
  {topic:'Hazardous Earth',kind:'Order the process',question:'What makes a composite volcano more explosive than a shield volcano?',why:'This answer was uncertain in your last Hazardous Earth assignment.',hint:'Focus on magma viscosity and trapped gas.',model:'Composite volcanoes have more viscous magma, so gas cannot escape easily. Pressure builds until the eruption becomes explosive.'},
  {topic:'Development Dynamics',kind:'Challenge the claim',question:'Why can GDP per capita hide inequality within a country?',why:'You selected GDP per capita as a measure of income distribution last week.',hint:'An average does not show how income is shared.',model:'GDP per capita is a national mean. The same average can exist where income is shared evenly or concentrated among a small group.'}
];
let questionIndex=0;
let ratings=[];
let toastTimer;

function showScreen(id){
  screens.forEach(screen=>screen.classList.toggle('is-active',screen.id===id));
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
  const active=document.getElementById(id);
  const focusTarget=active.querySelector('h1,button,input,textarea,select');
  if(focusTarget){
    if(!focusTarget.matches('button,input,textarea,select,a[href]')) focusTarget.setAttribute('tabindex','-1');
    requestAnimationFrame(()=>focusTarget.focus({preventScroll:true}));
  }
}

function showToast(message){
  toast.textContent=message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2400);
}

function setRole(role,{syncHash=true}={}){
  roleButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.role===role)));
  document.body.dataset.role=role;
  document.querySelector('.class-label').textContent=role==='teacher'?'10A Geography':'10A Geography';
  document.querySelector('.class-year').textContent=role==='teacher'?'Teacher view':'Year 10';
  document.querySelector('.bottom-nav').classList.toggle('is-hidden',role==='teacher');
  if(syncHash) history.replaceState(null,'',role==='teacher'?'#teacher':location.pathname+location.search);
  showScreen(role==='teacher'?'teacher-assign':'student-home');
}

function renderQuestion(){
  const q=questions[questionIndex];
  const number=questionIndex+1;
  const progress=(number/questions.length)*100;
  document.getElementById('session-position').textContent=`Card ${number} of ${questions.length}`;
  document.getElementById('review-position').textContent=`Card ${number} of ${questions.length}`;
  document.getElementById('session-progress-bar').style.width=`${progress}%`;
  document.getElementById('review-progress-bar').style.width=`${progress}%`;
  document.getElementById('card-topic').textContent=q.topic;
  document.getElementById('card-kind').textContent=q.kind;
  document.getElementById('card-question').textContent=q.question;
  document.getElementById('review-question').textContent=q.question;
  document.getElementById('review-topic').textContent=q.topic;
  document.getElementById('why-copy').textContent=q.why;
  document.getElementById('hint-text').textContent=q.hint;
  document.getElementById('model-answer').textContent=q.model;
  document.getElementById('recall-answer').value='';
  document.getElementById('hint-text').hidden=true;
}

function startSession(){
  questionIndex=0;
  ratings=[];
  renderQuestion();
  showScreen('revision-session');
  setTimeout(()=>document.getElementById('recall-answer').focus(),250);
}

function checkAnswer(){
  const value=document.getElementById('recall-answer').value.trim();
  document.getElementById('student-answer').textContent=value||'No answer entered — use the model to rebuild this idea.';
  showScreen('answer-review');
}

function renderResult(){
  const moved=ratings.filter(rating=>rating==='got-it').length;
  const sooner=ratings.length-moved;
  const repeated=ratings.filter(rating=>rating==='again').length;
  document.getElementById('result-forward').textContent=`${moved} ${moved===1?'card':'cards'}`;
  document.getElementById('result-sooner').textContent=`${sooner} ${sooner===1?'card':'cards'}`;
  document.getElementById('result-sooner-note').textContent=repeated?'Includes a return later today':'Back tomorrow';
  document.getElementById('result-copy').textContent=moved===ratings.length
    ?'All three cards are ready for a seven-day gap. They will return to check that recall still holds.'
    :`${moved} ${moved===1?'card is':'cards are'} ready for a longer gap. ${sooner} ${sooner===1?'card will':'cards will'} return sooner while the knowledge is still forming.`;
}

function rateAnswer(event){
  ratings[questionIndex]=event.currentTarget.dataset.rating;
  if(questionIndex<questions.length-1){
    questionIndex+=1;
    renderQuestion();
    showScreen('revision-session');
    setTimeout(()=>document.getElementById('recall-answer').focus(),250);
  }else{
    renderResult();
    showScreen('session-result');
  }
}

function updateSummary(){
  const topics=[...document.querySelectorAll('input[name="topic"]:checked')].map(input=>input.value);
  const target=document.querySelector('input[name="target"]:checked');
  document.getElementById('summary-topics').textContent=topics.length?topics.join(' + '):'Choose at least one topic';
  document.getElementById('summary-target').textContent=target?target.value:'—';
  const dateValue=document.getElementById('due-date').value;
  if(dateValue){
    const date=new Date(`${dateValue}T12:00:00`);
    document.getElementById('summary-date').textContent=date.toLocaleDateString('en-GB',{day:'numeric',month:'long'});
  }
}

document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='home'){event.preventDefault();showScreen(document.body.dataset.role==='teacher'?'teacher-assign':'student-home')}
  if(action==='theme'){
    const root=document.documentElement;
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    document.querySelectorAll('[data-action="theme"]').forEach(button=>button.setAttribute('aria-label',`Switch to ${root.dataset.theme==='dark'?'light':'dark'} mode`));
  }
  if(action==='start-session'||action==='start-assignment'||event.target.closest('[data-topic]')) startSession();
  if(action==='hint') document.getElementById('hint-text').hidden=false;
  if(action==='check-answer') checkAnswer();
  if(action==='restart') startSession();
  if(action==='preview-cards') showToast('Preview: 10 curated cards across the two selected topics.');
  if(action==='teacher-overview') showToast('The production version would return to the teacher dashboard.');
  if(action==='teacher-return') showScreen('teacher-assign');
});

roleButtons.forEach(button=>button.addEventListener('click',()=>setRole(button.dataset.role)));
window.addEventListener('hashchange',()=>setRole(location.hash==='#teacher'?'teacher':'student',{syncHash:false}));
document.querySelectorAll('[data-rating]').forEach(button=>button.addEventListener('click',rateAnswer));
document.querySelectorAll('#assignment-form input,#assignment-form select').forEach(control=>control.addEventListener('change',updateSummary));
document.getElementById('assignment-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!document.querySelector('input[name="topic"]:checked')){showToast('Choose at least one topic.');return}
  const classText=document.getElementById('teacher-class').selectedOptions[0].textContent;
  const [className,studentText]=classText.split(' · ');
  const students=studentText.match(/\d+/)?.[0]||'17';
  const topics=[...document.querySelectorAll('input[name="topic"]:checked')].map(input=>input.value);
  const target=document.querySelector('input[name="target"]:checked').value;
  const date=new Date(`${document.getElementById('due-date').value}T12:00:00`);
  document.getElementById('success-heading').textContent=`Revision set for ${className}.`;
  const topicList=new Intl.ListFormat('en-GB',{style:'long',type:'conjunction'}).format(topics);
  document.getElementById('success-copy').textContent=`${topicList} will appear in Assigned and each student’s Revision queue. Forge will personalise the cards within that scope.`;
  document.getElementById('success-students').textContent=students;
  document.getElementById('success-target').textContent=target;
  document.getElementById('success-date').textContent=date.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  showScreen('teacher-success');
});
document.getElementById('recall-answer').addEventListener('keydown',event=>{
  if((event.metaKey||event.ctrlKey)&&event.key==='Enter') checkAnswer();
});
setRole(location.hash==='#teacher'?'teacher':'student',{syncHash:false});
updateSummary();
