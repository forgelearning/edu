const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const SWA = 'SWA Geography';
const AGE = 'A-Level Geography Explained';
const MRSB = 'Mrs B Geography';
const GG = 'Geography Geyser';

module.exports = {
  slug: 'geography',
  subjects: ['geo'],
  name: 'Geography',
  level: 'A Level',
  intro: 'Edexcel A-level Geography topic overviews and revision for Papers 1 to 3. Videos play here in Forge.',
  heading: 'Edexcel 9GE0 · SWA Geography and others',
  groups: [
    { title: 'Tectonic processes and hazards', videos: [
      v('7M3ygJ-3hK8', 'Tectonics EQ1: why some places are at risk', 1, SWA),
      v('nL5G3_9g_20', 'Tectonic processes and hazards: full topic summary', 1, AGE),
      v('bmxh-5BaMBw', 'Theories of vulnerability', 1, GG),
      v('qY1z9c7wZpU', 'The hazard management cycle', 1, 'Mr Crosby does Geography'),
    ] },
    { title: 'Coastal landscapes and change', videos: [
      v('5dKu6RnNlrM', 'Coasts EQ1: coastal landscapes', 1, SWA),
      v('t4OYPhcDXZw', 'Coasts EQ4: managing coastal risk', 1, SWA),
      v('PlJ7QpDhqo0', 'Coastal management', 1, 'Launchpad Learning'),
    ] },
    { title: 'The water and carbon cycles', videos: [
      v('p8vrQeL1WTk', 'Water cycle EQ1: the global and drainage basin system', 1, SWA),
      v('KMHrP1gDk0Q', 'Water cycle and water insecurity overview', 1, MRSB),
      v('m3-dn9o6Xgk', 'Carbon cycle EQ1: the geological carbon cycle', 1, SWA),
      v('xKMTaJCJ6Ww', 'The carbon cycle', 1, 'Launchpad Learning'),
      v('r37FadUczD4', 'Energy security', 1, 'Ecclesbourne Geography'),
    ] },
    { title: 'Globalisation and regenerating places', videos: [
      v('R7qcfof6LM8', 'Globalisation EQ1: why globalisation has accelerated', 2, SWA),
      v('7YV-ibq1Cds', 'Globalisation: full topic summary', 2, AGE),
      v('X-HiiKonmG0', 'Regenerating places: full topic summary', 2, AGE),
      v('qzpEqzTkhY8', 'Regenerating places overview', 2, MRSB),
    ] },
    { title: 'Superpowers and global development', videos: [
      v('pwU9GPu225w', 'Superpowers EQ1: what superpowers are', 2, SWA),
      v('LLmj2l_J6fM', 'Superpowers: full topic summary', 2, AGE),
      v('PlUY6Hn1e-s', 'Health, human rights and intervention: full topic summary', 2, AGE),
      v('ecvtt7psonU', 'IGOs: the IMF, World Bank and WTO', 2, GG),
    ] },
  ],
};
