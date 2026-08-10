const fs = require('fs');

const root = __dirname + '/../..';
const template = fs.readFileSync(`${root}/gcse-science.html`, 'utf8');

const pages = [
  {
    file: 'gcse-chemistry.html',
    title: 'GCSE Separate Chemistry', code: '1CH0', subject: 'gcse-sep-chem', count: 32,
    description: 'Separate Chemistry across Papers 1 and 2: atomic structure, bonding, reactions, organic chemistry, analysis and practical reasoning.',
    coverage: [
      ['Paper 1 · Chemistry', 'Core chemistry', 'Atomic structure, bonding, chemical changes, acids, electrolysis, metals and equilibrium.', 'GCSE-SEP-CHEM-1'],
      ['Paper 2 · Chemistry', 'Applied chemistry', 'Rates, organic chemistry, analysis, resources, chemical calculations and practical application.', 'GCSE-SEP-CHEM-2']
    ],
    samples: [
      ['Chemistry · Atomic structure', 'Concept', 'What does the atomic number of an element show?', 'The number of protons', 'The number of neutrons', 'The total mass of the atom', 'The number of electron shells', 'Atomic number is the number of protons in the nucleus.'],
      ['Chemistry · Chemical changes', 'Application', 'Why does increasing temperature usually increase reaction rate?', 'Particles collide more often and with more energy', 'The activation energy becomes zero', 'Products become reactants', 'Particles stop moving', 'Heating increases particle speed and the proportion of collisions with enough energy to react.'],
      ['Chemistry · Organic chemistry', 'Concept', 'Which test identifies an alkene?', 'Bromine water is decolourised', 'Limewater turns cloudy', 'A lit splint gives a squeaky pop', 'Universal indicator turns blue', 'Alkenes contain a carbon–carbon double bond that reacts with bromine water.']
    ]
  },
  {
    file: 'gcse-physics.html',
    title: 'GCSE Separate Physics', code: '1PH0', subject: 'gcse-sep-phys', count: 32,
    description: 'Separate Physics across Papers 1 and 2: motion, forces, energy, electricity, waves, radiation and practical reasoning.',
    coverage: [
      ['Paper 1 · Physics', 'Core physics', 'Motion, forces, energy, waves, light, radioactivity and the equations behind them.', 'GCSE-SEP-PHYS-1'],
      ['Paper 2 · Physics', 'Applied physics', 'Electricity, magnetism, space, momentum, pressure, thermal physics and practical application.', 'GCSE-SEP-PHYS-2']
    ],
    samples: [
      ['Physics · Motion', 'Calculation', 'A runner covers 240 m in 30 s. What is the average speed?', '8 m/s', '30 m/s', '210 m/s', '7200 m/s', 'Average speed = distance ÷ time = 240 ÷ 30 = 8 m/s.'],
      ['Physics · Electricity', 'Concept', 'Which equation gives electrical power?', 'P = I × V', 'P = I ÷ V', 'P = V ÷ I', 'P = I + V', 'Electrical power equals current multiplied by potential difference: P = IV.'],
      ['Physics · Waves', 'Concept', 'Which wave can travel through a vacuum?', 'Light', 'Sound', 'Water surface waves', 'Seismic S-waves', 'Electromagnetic waves such as light do not need a medium.']
    ]
  },
  {
    file: 'gcse-biology.html',
    title: 'GCSE Separate Biology', code: '1BI0', subject: 'gcse-sep-bio', count: 32,
    description: 'Separate Biology across Papers 1 and 2: cells, transport, disease, genetics, homeostasis, ecology and practical reasoning.',
    coverage: [
      ['Paper 1 · Biology', 'Core biology', 'Cells, transport, disease, genetics, selection, health and the biological principles that connect them.', 'GCSE-SEP-BIO-1'],
      ['Paper 2 · Biology', 'Applied biology', 'Homeostasis, coordination, ecology, material cycles, biotechnology and practical application.', 'GCSE-SEP-BIO-2']
    ],
    samples: [
      ['Biology · Cells', 'Concept', 'What is the main role of ribosomes in a cell?', 'Making proteins', 'Releasing energy', 'Controlling osmosis', 'Storing genetic material', 'Ribosomes are the sites of protein synthesis.'],
      ['Biology · Genetics', 'Application', 'Two heterozygous parents have a child. What is the probability of two recessive alleles?', '25%', '0%', '50%', '75%', 'A cross of two heterozygous parents gives one recessive homozygous combination out of four.'],
      ['Biology · Disease', 'Concept', 'Why are antibiotics ineffective against viruses?', 'Viruses lack the bacterial targets antibiotics act on', 'Viruses have thicker cell walls', 'Viruses are too large to enter', 'Viruses can digest antibiotics', 'Antibiotics target bacterial structures or processes, not viruses reproducing inside host cells.']
    ]
  }
];

function sectionBetween(source, start, end, replacement) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Template marker not found: ${start}`);
  return source.slice(0, a) + replacement + source.slice(b);
}

function paperRows(config) {
  return config.coverage.map(([range, name, description, bank]) => `
    <div class="rank-row reveal">
      <span class="rank-badge" style="background:rgba(127,217,138,.12);color:var(--good)">Live</span>
      <span class="rank-range mono">${range}</span>
      <span class="rank-desc"><b>${name}</b> — ${description}</span>
      <a class="subj-link" href="forge-quiz.html?subject=${config.subject}&amp;bank=${bank}">Practise →</a>
    </div>`).join('');
}

function sampleCards(config) {
  return config.samples.map(([spec, fmt, stem, correct, a, b, c, scaffold]) => `
    <div class="bq">
      <div class="bq-head"><span class="spec mono"><b>${spec}</b></span><span class="fmt">${fmt}</span></div>
      <p class="q">${stem}</p>
      <button class="opt" data-right="1">${correct}</button>
      <button class="opt" data-mc="MC-SAMPLE-A" data-s="${scaffold}">${a}</button>
      <button class="opt" data-mc="MC-SAMPLE-B" data-s="${scaffold}">${b}</button>
      <button class="opt" data-mc="MC-SAMPLE-C" data-s="${scaffold}">${c}</button>
      <div class="scaffold"><span class="stag"></span><p></p></div>
      <p class="praise">Correct — the explanation is the part worth remembering for the exam. ✦</p>
    </div>`).join('');
}

for (const config of pages) {
  let page = template;
  page = page.replace(/<title>.*?<\/title>/, `<title>Forge — ${config.title} (Edexcel ${config.code})</title>`);
  page = page.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${config.description} Mapped to Edexcel ${config.code}.">`);
  page = page.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="Forge — ${config.title} (Edexcel ${config.code})">`);
  page = page.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${config.description} Mapped to Edexcel ${config.code}.">`);
  page = page.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="https://forgelearning.github.io/edu/${config.file}">`);
  page = page.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="Forge — ${config.title} (Edexcel ${config.code})">`);
  page = page.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${config.description} Mapped to Edexcel ${config.code}.">`);
  page = sectionBetween(page, '<header style="padding-top:56px">', '</header>', `<header style="padding-top:56px">
  <p class="tag eyebrow reveal"><a href="index.html#subjects" style="color:var(--slate);text-decoration:none">← All subjects</a></p>
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:12px"><div><span class="pill good reveal">Live — Papers 1 &amp; 2</span><span class="mono boards reveal" style="margin-left:10px">Edexcel · ${config.code}</span></div></div>
  <h1 class="reveal" style="font-size:clamp(32px,4.2vw,48px);font-weight:800;margin-top:14px;margin-bottom:10px">${config.title}</h1>
  <div class="subj-stat reveal" style="font-size:15px;margin-bottom:14px"><span class="subj-stat-n">${config.count}</span> questions · <span class="subj-stat-n">2</span> banks</div>
  <p class="sect-lede reveal">${config.description} Practise core knowledge, application, calculations and common misconceptions, then rework mistakes in Forge mode.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px" class="reveal"><a href="forge-quiz.html?subject=${config.subject}" class="btn btn-hot" style="text-decoration:none">Start practising</a><a href="gcse-science.html" class="cta-ghost" style="text-decoration:none;display:inline-flex;align-items:center;padding:0 18px;height:44px;border-radius:var(--radius-md);border:1px solid var(--line)">Combined Science</a></div>`);
  page = sectionBetween(page, '<section style="border-top:none;padding-top:52px">', '</section>', `<section style="border-top:none;padding-top:52px">
  <p class="tag eyebrow reveal">Spec coverage</p><h2 class="reveal">Mapped to Edexcel, paper by paper.</h2><p class="sect-lede reveal">The two-paper ${config.title} route is represented directly in Forge, so you can choose the content and method you need next.</p>
  <div class="rank-grid reveal" style="margin-top:24px">${paperRows(config)}
  </div>`);
  page = sectionBetween(page, '<section style="padding-top:52px">', '<section style="padding-top:52px;padding-bottom:64px">', `<section style="padding-top:52px">
  <p class="tag eyebrow reveal">A preview of the format</p><h2 class="reveal">Three sample questions.</h2><p class="sect-lede reveal">Misconception-tagged questions with clear explanations after answering — the same loop used in the live banks.</p>
  <div class="bank-nav"><span class="bank-progress" id="ecoProgress">Question 1 of 3</span><div class="bank-nav-btns"><button type="button" class="bank-nav-btn" id="ecoPrev" aria-label="Previous question">← Prev</button><button type="button" class="bank-nav-btn" id="ecoNext" aria-label="Next question">Next →</button></div></div>
  <div class="bank" id="eco-bank" style="width:auto;position:static;left:auto;margin-left:0;padding:0;display:block">${sampleCards(config)}
  </div></section>`);
  page = sectionBetween(page, '<section style="padding-top:52px;padding-bottom:64px">', '</section>', `<section style="padding-top:52px;padding-bottom:64px"><div class="wait" style="text-align:center"><p class="tag eyebrow reveal">All papers live</p><h2 class="reveal">Keep building your ${config.title.replace('GCSE Separate ', '')} foundations.</h2><p class="sect-lede reveal" style="margin:0 auto">The full Edexcel ${config.code} two-paper structure is represented in Forge. More depth, practicals and exam-style variation can keep growing from here.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px" class="reveal"><a href="forge-quiz.html?subject=${config.subject}" class="btn btn-hot" style="text-decoration:none">Practise the live banks</a><a href="forge-quiz.html" class="cta-ghost" style="text-decoration:none;display:inline-flex;align-items:center;padding:0 18px;height:44px;border-radius:var(--radius-md);border:1px solid var(--line)">Try a live subject</a></div></div>`);
  page = page.replace(/<span class="subj-stat-n">144<\/span>/g, `<span class="subj-stat-n">${config.count}</span>`);
  page = page.replace(/GCSE Combined Science/g, config.title);
  page = page.replace(/1SC0/g, config.code);
  fs.writeFileSync(`${root}/${config.file}`, page);
}
