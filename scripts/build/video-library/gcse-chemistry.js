// `triple: true` marks content that is in Edexcel 1CH0 (separate Chemistry) but
// not in 1SC0 (Combined Science); gcse-combined-science.js leaves those out.
const fsl = (id, title, topic, extra) => ({ id, title, tag: `Topic ${topic} · Freesciencelessons`, ...extra });
const triple = { triple: true };

module.exports = {
  slug: 'gcse-chemistry',
  subjects: ['gcse-sep-chem'],
  name: 'Chemistry',
  level: 'GCSE',
  intro: 'Edexcel GCSE Chemistry explanations, grouped by topic. Videos play here in Forge.',
  heading: 'Edexcel 1CH0 · Freesciencelessons',
  groups: [
    { title: 'Key concepts in chemistry', videos: [
      fsl('cI2Shr8nns8', 'The nuclear model of the atom', 1),
      fsl('nyvVjJf7RAU', 'Atomic number and mass number', 1),
      fsl('XbDtmORzKO8', 'Ionic bonding', 1),
      fsl('3hUwVYOue5s', 'Properties of ionic compounds', 1),
      fsl('m5u4STdFlOE', 'Covalent bonding', 1),
      fsl('Md4BQL91U6w', 'Calculating moles of a compound', 1),
    ] },
    { title: 'States of matter and mixtures', videos: [
      fsl('XKOgDiFNkiA', 'Fractional distillation', 2),
      fsl('-XCPPB-sBFU', 'Chromatography', 2),
    ] },
    { title: 'Chemical changes', videos: [
      fsl('ZWZTDiwOWiI', 'Acids and alkalis', 3),
      fsl('QlSsle_jSQ8', 'Three reactions of acids', 3),
      fsl('4pIHhXfGZlE', 'Strong and weak acids', 3),
      fsl('AhTRiL6xjBA', 'Introducing electrolysis', 3),
      fsl('6WjC_Vi4roA', 'Electrolysis of aqueous solutions', 3),
    ] },
    { title: 'Extracting metals and equilibria', videos: [
      fsl('MDQr5QFVGkk', 'The reactivity series', 4),
      fsl('MXTSels6e2Y', 'Extraction of metals', 4),
      fsl('66qcNNJFy6E', 'Reversible reactions', 4),
      fsl('SlI5m0RQqik', 'Temperature and reversible reactions', 4),
    ] },
    { title: 'Transition metals, titrations and cells', videos: [
      fsl('A5RpVT1WA8E', 'Transition elements', 5, triple),
      fsl('x8DLLCNMKAs', 'Titration calculations', 5, triple),
      fsl('iJgMuDzkdkI', 'Fuel cells', 5, triple),
    ] },
    { title: 'Groups in the periodic table', videos: [
      fsl('Z9U0728-fPY', 'Group 1, the alkali metals', 6),
      fsl('5l-5sKDudq8', 'Group 7, the halogens', 6),
    ] },
    { title: 'Rates of reaction and energy changes', videos: [
      fsl('N5p06i9ilmo', 'Measuring rates of reaction', 7),
      fsl('hel8fQjxcO8', 'Catalysts', 7),
      fsl('4HS6D0hTzdg', 'Exothermic and endothermic reactions', 7),
      fsl('eExCBkp4jB4', 'Bond energy calculations', 7),
    ] },
    { title: 'Fuels and Earth science', videos: [
      fsl('3I7yCkSXPos', 'Fractional distillation of crude oil', 8),
      fsl('t1Z3GlNldLA', 'The atmosphere', 8),
      fsl('K5vXnDGcOE4', 'The greenhouse effect', 8),
    ] },
    { title: 'Tests for ions, alcohols and polymers', videos: [
      fsl('Bd0A44Iv2OI', 'Flame tests', 9, triple),
      fsl('dBvpd9RhX8E', 'Metal hydroxide precipitates', 9, triple),
      fsl('n1SiWOIJayI', 'Identifying non-metal ions', 9, triple),
      fsl('uFZasZ-hs_A', 'Alcohols', 9, triple),
      fsl('ketAGS1gkQM', 'Carboxylic acids', 9, triple),
      fsl('GhvevdJU_DM', 'Addition polymers', 9, triple),
      fsl('QBuSFPOtcJ4', 'Condensation polymers', 9, triple),
    ] },
  ],
};
