const g = (id, title, channel) => ({ id, title, tag: `Grammar · ${channel}` });
const c = (id, title, theme, channel) => ({ id, title, tag: `Theme ${theme} · ${channel}` });
const ALEXA = 'Learn French With Alexa';
const DYLANE = 'The perfect French with Dylane';

module.exports = {
  slug: 'french',
  subjects: ['french'],
  name: 'French',
  level: 'A Level',
  intro: 'Edexcel A-level French: the grammar that comes up in translation, plus background to the themes. Videos play here in Forge.',
  heading: 'Edexcel 9FR0 · Learn French With Alexa and others',
  groups: [
    { title: 'Tenses', videos: [
      g('R7CMGVsanu8', 'Être or avoir in the passé composé', ALEXA),
      g('aG-I7AiC4Qs', 'The imperfect and the perfect tense', 'Coffee Break French'),
      g('6HDCdU3yJtk', 'The future: futur proche and futur simple', ALEXA),
      g('fOmO3b4chW0', 'The conditional and the imperfect', ALEXA),
      g('QvlGkutnVXE', 'The subjunctive', ALEXA),
    ] },
    { title: 'Pronouns, negatives and complex structures', videos: [
      g('2aFGlzmmVu4', 'Direct object pronouns', ALEXA),
      g('xQqiwEEklkk', 'Lui and leur or le, la and les?', 'French in Plain Sight'),
      g('6pYRH9rZZq0', 'The pronouns y and en', ALEXA),
      g('qDlBFrgIUKI', 'Relative pronouns: qui, que, dont, où and lequel', DYLANE),
      g('40ZnnWck0Zk', 'Negatives', DYLANE),
    ] },
    { title: 'Background to the themes', videos: [
      c('S_dlWdIciEE', 'What is la Francophonie?', 2, 'FRANCE 24 English'),
      c('MwYLV0j1Ew8', 'What is the banlieue?', 3, 'FRANCE 24 English'),
      c('5bqWm3DLcYk', 'Free France and Vichy France', 4, 'History Matters'),
      c('YKP_6-198x8', 'The French Resistance', 4, 'Simple History'),
    ] },
  ],
};
