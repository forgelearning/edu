const g = (id, title, channel) => ({ id, title, tag: `Grammar · ${channel}` });
const ib = (id, title, channel) => ({ id, title, tag: `IB Language B · ${channel}` });
const TCCT = 'Twin Cities Chinese Tutor';

module.exports = {
  slug: 'mandarin',
  name: 'Mandarin',
  level: 'Other qualifications',
  intro: 'IB Mandarin B: key grammar patterns, text types and the Identities theme. Videos play here in Forge.',
  heading: 'IB Language B SL · Twin Cities Chinese Tutor and others',
  groups: [
    { title: 'Aspect and sentence patterns', videos: [
      g('vyMmPgJTKrI', 'Using 了 at the end of a sentence', 'Grace Mandarin Chinese'),
      g('l_78F9fzJuE', 'Three uses of 过', TCCT),
      g('9MHpcZrhicY', 'The 是……的 pattern for emphasis', TCCT),
      g('9mbQWebrBiA', 'The 把 construction', 'Everyday Chinese'),
      g('CygUFo09-V8', 'The passive with 被', 'I Heart Mandarin'),
    ] },
    { title: 'Comparisons, particles and connectives', videos: [
      g('xTTOHJv-RzU', 'Comparisons with 比', TCCT),
      g('4Rbe-LGWYO4', 'Which de: 的, 得 or 地?', 'Chinese Zero to Hero'),
      g('5BNxDj_h9iQ', 'Common measure words', 'Grace Mandarin Chinese'),
      { ...g('o8mj7V2fZjE', 'Paired conjunctions: 因为……所以 and 虽然……但是', 'jiangjiang mandarin'), noEmbed: true },
    ] },
    { title: 'Text handling, writing and identities', videos: [
      ib('1Yj8ls-sm2Y', 'Paper 2 reading tips', 'Mandarin Feast'),
      ib('7U1rivV8s84', 'Text types: tone, audience and purpose', 'New Concept Mandarin'),
      ib('0_CSmSjvJ0A', 'Seven connectives for higher-scoring writing', 'New Concept Mandarin'),
      ib('5hSwjd2nHNc', 'Introducing the Identities theme', 'We Learn to Share'),
      ib('uqaRZw9pnKU', 'Oral practice: health and wellbeing (Identities)', 'YAYA Mandarin'),
    ] },
  ],
};
