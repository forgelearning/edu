const v = (id, title, topic, channel) => ({ id, title, tag: `Topic ${topic} · ${channel}` });
const EBMS = 'edexcelbgeographymadesimple';
const JC = 'JCgeogsupport';

module.exports = {
  slug: 'gcse-geography',
  subjects: ['gcse-geo'],
  name: 'Geography',
  level: 'GCSE',
  intro: 'Edexcel B GCSE Geography explanations and case studies for Papers 1 to 3. Videos play here in Forge.',
  heading: 'Edexcel B 1GB0 · edexcelbgeographymadesimple and others',
  groups: [
    { title: 'Hazardous Earth', videos: [
      v('SrLaitvQnpk', 'The global atmospheric circulation', 1, EBMS),
      v('UOL3vsgvtQI', 'How tropical cyclones form', 1, EBMS),
      v('2BM_vjYmdJc', 'Climate change', 1, 'No Waffle GCSE'),
      v('bQ8HKc96mZs', 'Types of tectonic plate boundary', 1, EBMS),
      v('BgO6V4GnBiE', 'Case study: the Nepal earthquakes, 2015', 1, EBMS),
      v('pV4rnn9-p9A', 'Case study: Sakurajima volcano', 1, EBMS),
    ] },
    { title: 'Development dynamics', videos: [
      v('8GCo8i-X9Ak', 'How we measure development', 2, 'Geography Juice'),
      v('e6SHmmrf1bs', 'Top-down and bottom-up development', 2, EBMS),
      v('S7EQSfi4cGA', 'India’s challenges and international role', 2, JC),
    ] },
    { title: 'Challenges of an urbanising world', videos: [
      v('nDKzcZ48ZnQ', 'Megacities and why cities are growing', 3, 'HRB Education'),
      v('f1V8L66YNMc', 'Mumbai’s urban structure, site and situation', 3, EBMS),
      v('uqhfx9D3Pnc', 'Sustainability in cities', 3, JC),
    ] },
    { title: 'The UK’s evolving physical and human landscape', videos: [
      v('oOvm4c8O73E', 'The UK’s physical landscape: the basics', 4, 'Simple Geography'),
      v('_NRpl1PGiGc', 'Cliff processes and climate change on the coast', 4, EBMS),
      v('UmUbkiSIHN0', 'Rivers: processes and landforms in the upper course', 4, EBMS),
      v('84hzSvNV-_I', 'Rivers: the Bradshaw model and lower-course landforms', 4, EBMS),
      v('UXPxHwpCBW0', 'London’s urban structure, site and situation', 5, EBMS),
      v('rHNUPRZWErw', 'London’s urban sprawl and regeneration', 5, EBMS),
    ] },
    { title: 'Geographical investigations', videos: [
      v('EI-UAeBqNSw', 'Edexcel geography fieldwork', 6, 'Field Studies Council'),
      v('Gl6sPzd2gy8', 'River fieldwork', 6, 'BBC Bitesize'),
    ] },
    { title: 'People and the biosphere, forests and energy', videos: [
      v('X1dAbCKmhmU', 'What and where the Earth’s biomes are', 7, EBMS),
      v('FWzyF77hYA8', 'Biotic and abiotic factors in biomes', 7, EBMS),
      v('HwmNFtieVR8', 'Tropical rainforests', 8, 'No Waffle GCSE'),
      v('ov5vNiXjm14', 'Types of energy resource', 9, EBMS),
      v('xQd8NCTUqoA', 'How and why global energy use varies', 9, EBMS),
      v('Gd0gnNpJNZI', 'Alternatives to fossil fuels', 9, EBMS),
    ] },
  ],
};
