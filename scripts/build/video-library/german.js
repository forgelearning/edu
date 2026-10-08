const g = (id, title, channel) => ({ id, title, tag: `Grammar · ${channel}` });
const c = (id, title, theme, channel) => ({ id, title, tag: `Theme ${theme} · ${channel}` });
const EG = 'Easy German';
const YGT = 'YourGermanTeacher';
const BE = 'Bausteine eins';

module.exports = {
  slug: 'german',
  name: 'German',
  level: 'A Level',
  intro: 'Edexcel A-level German: cases, word order and the complex structures that come up in translation, plus background to reunification. Videos play here in Forge.',
  heading: 'Edexcel 9GN0 · Easy German, YourGermanTeacher and others',
  groups: [
    { title: 'Cases and adjective endings', videos: [
      g('_F_zkRPRX6A', 'All the German cases', EG),
      g('-XjraxIEzrk', 'Accusative or dative?', YGT),
      g('SXKD5bQl-zQ', 'Adjective endings: the complete system', YGT),
    ] },
    { title: 'Word order', videos: [
      g('m36urPvYD0A', 'German word order', YGT),
      g('om-K1Z2U89w', 'Subordinating conjunctions', BE),
      g('shP_fHFCHIo', 'Relative clauses', BE),
    ] },
    { title: 'Complex structures', videos: [
      g('QBBlMrj0lTw', 'Modal verbs', EG),
      g('5DcelIoemzA', 'The passive', EG),
      g('uMlagwZP9dw', 'Konjunktiv II', EG),
    ] },
    { title: 'Background to reunification', videos: [
      c('A9fQPzZ1-hg', 'The rise and fall of the Berlin Wall', 4, 'TED-Ed'),
      c('A6UXMUbsiT8', 'Who opposed German reunification?', 4, 'History Matters'),
    ] },
  ],
};
