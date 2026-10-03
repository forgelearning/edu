/* Keep class and independent study distinct when both are available on one device. */
(function(root){
  var KEY='forge-study-mode';
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(e){return null;}}
  function freeSession(){var session=read('forge-free-session');return session&&session.studentId&&session.freeToken?session:null;}
  function classSession(){var session=read('forge-student');return session&&session.studentId&&session.classId?session:null;}
  function isIndependent(){
    if(!freeSession())return false;
    if(!classSession())return true;
    try{return localStorage.getItem(KEY)==='independent';}catch(e){return false;}
  }
  function set(mode){
    if(mode!=='independent'&&mode!=='class')return false;
    if(mode==='independent'&&!freeSession())return false;
    if(mode==='class'&&!classSession())return false;
    try{localStorage.setItem(KEY,mode);return true;}catch(e){return false;}
  }
  root.ForgeStudyMode={freeSession:freeSession,classSession:classSession,isIndependent:isIndependent,set:set};
})(window);
