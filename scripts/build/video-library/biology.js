const v = (id, title, spec, channel) => ({ id, title, tag: `${spec} · ${channel}` });
const BR = 'BioRach';
const ME = 'Miss Estruch Biology';
const BC = 'Biology with Christine';

module.exports = {
  slug: 'biology',
  name: 'Biology',
  level: 'A Level',
  intro: 'OCR A A-level Biology explanations, grouped by module. Videos open on YouTube.',
  heading: 'OCR A H420 · BioRach, Miss Estruch and others',
  groups: [
    { title: 'Module 2: Cells and biological molecules', videos: [
      v('p-0tqXmQsnw', 'Cell structure and microscopy', '2.1.1', ME),
      v('8d2Edz46UF4', 'Protein structure', '2.1.2', ME),
      v('1ibWOa-S4bI', 'Monosaccharides and disaccharides', '2.1.2', 'Cognito'),
      v('55oCUwxKpsk', 'Lipids: triglycerides', '2.1.2', 'Launchpad Learning'),
      v('eRAGWeEoOXc', 'DNA replication', '2.1.3', 'Freesciencelessons'),
      v('ChC_30uF1m8', 'Protein synthesis', '2.1.3', 'Freesciencelessons'),
    ] },
    { title: 'Module 2: Enzymes, membranes and cell division', videos: [
      v('KTK7KUuFiow', 'The basics of enzymes', '2.1.4', BR),
      v('2dzd_Ilu4cE', 'Factors affecting enzyme activity', '2.1.4', BC),
      v('YiUeRM3lHE0', 'Enzyme inhibition', '2.1.4', BR),
      v('sd-EY51l438', 'The fluid mosaic model of membranes', '2.1.5', ME),
      v('vHwCSQAYiTU', 'The cell cycle and mitosis', '2.1.6', ME),
      v('vJjuJInJ6-Y', 'Meiosis', '2.1.6', 'Cognito'),
    ] },
    { title: 'Module 3: Exchange and transport', videos: [
      v('Wyer9wvaxmM', 'The human gas exchange system', '3.1.1', ME),
      v('GUX9pSiEcZQ', 'The mammalian heart', '3.1.2', BC),
      v('nlUuA-Nx5q0', 'The cardiac cycle', '3.1.2', 'Clare Biology'),
      v('q5fuYZskq9E', 'Transport systems in plants', '3.1.3', BR),
      v('3SSZjvLWcm0', 'Transpiration', '3.1.3', BR),
    ] },
    { title: 'Module 4: Disease, biodiversity and evolution', videos: [
      v('LRSWeEqCAqo', 'The immune response', '4.1.1', BR),
      v('b9CLL8idzf8', 'Primary and secondary immune responses', '4.1.1', 'Launchpad Learning'),
      v('Vj3micfREbs', 'Biodiversity and sampling', '4.2.1', BR),
      v('j6Enb3DlKZY', 'Classification and binomial nomenclature', '4.2.2', BR),
      v('TTjjKKuzxYI', 'Evolution by natural selection', '4.2.2', BR),
    ] },
    { title: 'Module 5: Communication and homeostasis', videos: [
      v('DlroQH4Fg3k', 'Kidney structure', '5.1.2', BC),
      v('Xq8JX7L8-ME', 'Osmoregulation', '5.1.2', BC),
      v('gXMgVE9UDSE', 'Resting and action potentials', '5.1.3', BR),
      v('uMpUVd_vLIw', 'Endocrine communication', '5.1.4', BC),
      v('EfHRhFLifR8', 'Insulin secretion', '5.1.4', BC),
      v('FMTLCE4YSH4', 'Plant hormones', '5.1.5', BR),
    ] },
    { title: 'Module 5: Energy for biological processes', videos: [
      v('9kC-rTFauu0', 'The light-dependent stage of photosynthesis', '5.2.1', BR),
      v('HwUi1vd5dSk', 'The Calvin cycle', '5.2.1', BR),
      v('dDm5V7bTlX4', 'The link reaction and Krebs cycle', '5.2.2', BR),
    ] },
    { title: 'Module 6: Genetics, ecosystems and populations', videos: [
      v('FYw2F0uku_Q', 'Phenotypic ratios', '6.1.2', BR),
      v('8LrPbBkflfU', 'The chi-squared test in inheritance', '6.1.2', ME),
      v('B8FJJuM8fNA', 'The polymerase chain reaction (PCR)', '6.1.3', BR),
      v('PoMDckaA0Mo', 'DNA profiling', '6.1.3', BR),
      v('mVfRHtekGBo', 'Cloning', '6.2.1', BR),
      v('XHo2St9TCs0', 'Ecosystems', '6.3.1', BC),
      v('MrZTOJbB5fY', 'Population size', '6.3.2', BC),
    ] },
  ],
};
