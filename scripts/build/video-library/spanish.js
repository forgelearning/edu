const g = (id, title, channel) => ({ id, title, tag: `Grammar · ${channel}` });
const BS = 'Breakthrough Spanish';
const LT = 'The Language Tutor';
const MDS = 'My Daily Spanish';

module.exports = {
  slug: 'spanish',
  subjects: ['span'],
  name: 'Spanish',
  level: 'A Level',
  intro: 'Edexcel A-level Spanish: grammar traps, translation and background to the themes. Videos play here in Forge.',
  heading: 'Edexcel 9SP0 · Breakthrough Spanish, The Language Tutor and others',
  groups: [
    { title: 'Grammar traps', videos: [
      g('X-7k7R3Ca9U', 'Ser and estar', MDS),
      g('80qpuqdO-Ec', 'Por and para', MDS),
      g('3rJjIpFaGOo', 'The preterite and the imperfect', BS),
      g('TUmuavAKLEI', 'Object pronouns', BS),
    ] },
    { title: 'Tenses and moods', videos: [
      g('U42loE1zhdw', 'The future tense', LT),
      g('nRaMf1Y1TCM', 'The conditional', LT),
      g('-MZwa46X2C4', 'The subjunctive: the basics', BS),
      g('CRvXpo45oHw', 'The subjunctive in more depth', LT),
    ] },
    { title: 'Translation', videos: [
      { id: '1fXMngP7eEc', title: 'Translating from English into Spanish', tag: 'Translation · ALEVELSPANISH' },
      { id: 'sJsMLQSy4Fs', title: 'Tricky A-level translation phrases', tag: 'Translation · astarspanish' },
    ] },
    { title: 'Background to Theme 4', videos: [
      { id: 'Yw-OxbtF1iY', title: 'The Spanish Civil War and Franco', tag: 'Theme 4 · History Matters' },
      { id: 'WYts75ZEsIE', title: 'Spain’s transition to democracy', tag: 'Theme 4 · SideQuest' },
    ] },
  ],
};
