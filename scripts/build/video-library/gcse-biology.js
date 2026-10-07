// `triple: true` marks content that is in Edexcel 1BI0 (separate Biology) but
// not in 1SC0 (Combined Science); gcse-combined-science.js leaves those out.
const fsl = (id, title, topic, extra) => ({ id, title, tag: `Topic ${topic} · Freesciencelessons`, ...extra });
const cognito = (id, title, topic) => ({ id, title, tag: `Topic ${topic} · Cognito` });
const triple = { triple: true };

module.exports = {
  slug: 'gcse-biology',
  name: 'Biology',
  level: 'GCSE',
  intro: 'Edexcel GCSE Biology explanations, grouped by topic. Videos open on YouTube.',
  heading: 'Edexcel 1BI0 · Freesciencelessons and Cognito',
  groups: [
    { title: 'Key concepts', videos: [
      fsl('mZLSJOVI4l8', 'Animal cells', 1),
      fsl('t7mp8JG2Q4U', 'Plant cells', 1),
      fsl('L5StAE_uuxM', 'Microscopy and magnification', 1),
      fsl('ypHpbHfDJsA', 'Digestive enzymes', 1),
      fsl('AgMvvybtRL4', 'The effect of temperature and pH on enzymes', 1),
      fsl('B0cH91joZwA', 'Osmosis', 1),
      fsl('ECldVkp6Rw0', 'Active transport', 1),
    ] },
    { title: 'Cells and control', videos: [
      fsl('9ttuZxrJZpk', 'Cell division by mitosis', 2),
      fsl('JeMxCl4gpXI', 'Stem cells', 2),
      fsl('oDS1hAqWp2M', 'The nervous system', 2),
      fsl('G_clJP1VGtk', 'The eye', 2, triple),
    ] },
    { title: 'Genetics', videos: [
      fsl('w5SRMZlYR4w', 'Meiosis and fertilisation', 3),
      fsl('o4LHU79fB3s', 'The structure of DNA', 3),
      fsl('reVLRjZIh3c', 'Alleles', 3),
      cognito('BtPo9F-nkho', 'Genetic diagrams and Punnett squares', 3),
    ] },
    { title: 'Natural selection and genetic modification', videos: [
      fsl('7RraYCKvTXc', 'Evolution by natural selection', 4),
      fsl('gu9T91GJXDo', 'Genetic engineering', 4),
    ] },
    { title: 'Health, disease and medicines', videos: [
      fsl('QYWNXp36O48', 'Communicable and non-communicable disease', 5),
      fsl('wUm71FPuVCQ', 'Pathogens', 5),
      fsl('HSrrPdJDqxM', 'The immune system', 5),
      fsl('uPeZBhJYlnU', 'Vaccination', 5),
      fsl('5wSfCZESRHU', 'Cardiovascular disease', 5),
    ] },
    { title: 'Plant structures and their functions', videos: [
      fsl('rAJGnS_ktk4', 'Photosynthesis', 6),
      fsl('9yTDokLRZs0', 'Transpiration', 6),
      fsl('_Bf5WKEMB5o', 'Plant hormones', 6, triple),
    ] },
    { title: 'Animal coordination, control and homeostasis', videos: [
      fsl('iXswGsfeHJg', 'The menstrual cycle', 7),
      fsl('77oyUdNZ054', 'Control of blood glucose', 7),
      fsl('DbLVB_EDnRs', 'The kidneys', 7, triple),
    ] },
    { title: 'Exchange and transport in animals', videos: [
      fsl('bpYaKM2hVFY', 'The heart and circulation', 8),
      fsl('Wx-MrhlOFMk', 'Arteries, veins and capillaries', 8),
      fsl('ZKAaDbTP6Dc', 'Respiration', 8),
    ] },
    { title: 'Ecosystems and material cycles', videos: [
      fsl('dRFQ8rZCK6Q', 'Food chains and predator–prey cycles', 9),
      fsl('ePsjdKoSA9g', 'Competition and interdependence', 9),
      fsl('2MW6nwf80XM', 'Sampling organisms', 9),
      fsl('I5UR9uMeWuQ', 'Biodiversity', 9),
      fsl('cWj3u8voDSg', 'The carbon cycle', 9),
    ] },
  ],
};
