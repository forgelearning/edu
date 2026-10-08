/* Teacher-reviewed external help for AQA A-level Chemistry.
 * Keep video rules narrow: a topic can contain questions that the video does
 * not explain. The notes link remains available for every Chemistry point. */
(function(root){
  'use strict';
  var PMT='https://www.physicsandmathstutor.com/chemistry-revision/a-level-aqa/';
  var NOTES={
    '3.1.1':['Atomic structure notes','https://www.chemguide.co.uk/atoms/propsmenu.html'],
    '3.1.3':['Bonding notes','https://www.chemguide.co.uk/atoms/bondingmenu.html'],
    '3.1.4':['Energetics notes','https://www.chemguide.co.uk/physical/energeticsmenu.html'],
    '3.1.6':['Chemical equilibria notes','https://www.chemguide.co.uk/physical/equilibmenu.html'],
    '3.1.12':['Acids and bases notes','https://www.chemguide.co.uk/physical/acideqiamenu.html'],
    '3.2.5':['Transition metals notes','https://www.chemguide.co.uk/inorganic/transitionmenu.html'],
    '3.3.14':['Organic mechanisms notes','https://www.chemguide.co.uk/mechmenu.html']
  };
  var GROUPS={
    'physical-i':['AQA Physical Chemistry I notes',PMT+'physical-i/'],
    'physical-ii':['AQA Physical Chemistry II notes',PMT+'physical-ii/'],
    'inorganic-i':['AQA Inorganic Chemistry I notes',PMT+'inorganic-i/'],
    'inorganic-ii':['AQA Inorganic Chemistry II notes',PMT+'inorganic-ii/'],
    'organic-i':['AQA Organic Chemistry I notes',PMT+'organic-i/'],
    'organic-ii':['AQA Organic Chemistry II notes',PMT+'organic-ii/']
  };
  function group(code){
    var parts=code.split('.'),number=Number(parts[2]);
    if(parts[1]==='1')return 'physical-'+(number<=7?'i':'ii');
    if(parts[1]==='2')return 'inorganic-'+(number<=3?'i':'ii');
    if(parts[1]==='3')return 'organic-'+(number<=6?'i':'ii');
    return null;
  }
  function videoFor(code,question){
    var text=String(question.stem||'')+' '+String(question.scaffold||'');
    if(code==='3.1.1'){
      if(/mass spectrom|time.of.flight|\bTOF\b|\bm\/z\b|relative atomic mass/i.test(text))return ['TOF mass spectrometry explained','WoNzJUu3gKA'];
      if(/ionisation energy|ionization energy|ionisation energies/i.test(text))return ['Ionisation energies explained','PNZV862SN6Q'];
      if(/electron configuration|electronic structure|orbital|sub.?shell|energy level/i.test(text))return ['Atomic structure and electron configuration','oH0tpyrIcSY'];
    }
    if(code==='3.1.3'&&/intermolecular|van der waals|hydrogen bond|dipole/i.test(text))return ['Intermolecular forces explained','6EePsoVMO_4'];
    if(code==='3.1.4'&&/enthalpy|bond energy|bond energ|exothermic|endothermic/i.test(text))return ['Enthalpy and bond energies explained','Ks1CtqsafSg'];
    return null;
  }
  function forQuestion(question){
    var id=String(question&&question.specPointId||'');
    var match=id.match(/^aqa-a-chem-(3\.[123]\.\d+)$/);
    if(!match)return [];
    var code=match[1],notes=NOTES[code]||GROUPS[group(code)],video=videoFor(code,question);
    if(code==='3.1.1'&&video&&video[1]==='WoNzJUu3gKA')notes=['Mass spectrometry notes','https://www.chemguide.co.uk/analysis/masspecmenu.html'];
    var out=[];
    if(video)out.push({kind:'video',label:video[0],provider:'YouTube · Eliot Rintoul',url:'https://www.youtube.com/watch?v='+video[1]});
    if(notes)out.push({kind:'notes',label:notes[0],provider:NOTES[code]?'Chemguide':'Physics & Maths Tutor',url:notes[1]});
    return out;
  }
  function appendTo(feedback,question){
    if(!feedback||!root.document)return;
    var resources=forQuestion(question);
    if(!resources.length)return;
    var section=root.document.createElement('section');
    section.className='forge-chemistry-help';
    section.setAttribute('aria-label','Further Chemistry help');
    var heading=root.document.createElement('h3');
    heading.textContent='Need another explanation?';
    section.appendChild(heading);
    var list=root.document.createElement('div');
    list.className='forge-chemistry-help__links';
    resources.forEach(function(resource){
      var link=root.document.createElement('a');
      link.href=resource.url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.className='forge-chemistry-help__link';
      var name=root.document.createElement('strong');
      name.textContent=(resource.kind==='video'?'Watch: ':'Read: ')+resource.label;
      var provider=root.document.createElement('span');
      provider.textContent=resource.provider+' · opens in a new tab';
      link.appendChild(name);link.appendChild(provider);list.appendChild(link);
    });
    section.appendChild(list);
    // Sit above the action buttons. The buttons live inside
    // .forge-feedback-actions, so insert before that wrapper: inserting before
    // a button that is not a direct child throws, and the throw stopped the
    // quiz wiring up "Try a similar question" and "Continue".
    var actions=feedback.querySelector('.forge-feedback-actions');
    feedback.insertBefore(section,actions&&actions.parentNode===feedback?actions:null);
  }
  root.ForgeChemistryResources={forQuestion:forQuestion,appendTo:appendTo};
})(window);
