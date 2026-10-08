const { literaryTerms } = require('./shared/english-terms');
const v = (id, title, area, channel) => ({ id, title, tag: `${area} · ${channel}` });

module.exports = {
  slug: 'english-language-literature',
  name: 'English Language and Literature',
  level: 'A Level',
  intro: 'AQA A-level English Language and Literature: linguistic and literary terminology, spoken language and exam technique. Videos play here in Forge.',
  heading: 'AQA 7707 · G Perrett, Excel at English and others',
  groups: [
    { title: 'Linguistic terminology and spoken language', videos: [
      v('Qmpv09cI1eQ', 'Word classes', 'Terminology', 'Eleanor Hare'),
      v('4OeBco-1p9o', 'Pragmatics', 'Terminology', 'Paul Heselton'),
      v('Ab0_20xUMyg', 'Spoken language: exploring mode', 'Spoken language', 'G Perrett'),
      v('J8eVoqTNF7w', 'Spoken language: the pragmatics of spoken discourse', 'Spoken language', 'G Perrett'),
    ] },
    literaryTerms,
    { title: 'Remembered places, writing about society and exam technique', videos: [
      v('ZB3rWRrUHAo', 'Introducing the Paris anthology', 'Paper 1', 'Excel at English'),
      v('qDisOwpuGQk', 'Exploring multimodal texts', 'Paper 1', 'Excel at English'),
      { ...v('7kC1yrRuKzk', 'Comparing texts', 'Exam technique', 'A-Level English Language'), noEmbed: true },
      v('IoxbwJVEsgE', 'Critical perspectives: The Handmaid’s Tale', 'Paper 2', 'G Perrett'),
    ] },
  ],
};
