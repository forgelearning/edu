// Few videos target the OCR specification directly. These cover the same
// content (life stages and PIES, factors and life events, care values,
// communication, safeguarding), and most were made for BTEC Nationals, which
// the tags say so students are not misled about the exam they describe.
const v = (id, title, topic, channel) => ({ id, title, tag: `${topic} · ${channel}` });
const AL = 'Alan’s lessons (BTEC)';
const T2U = 'tutor2u (BTEC)';

module.exports = {
  slug: 'health-social-care',
  name: 'Health and Social Care',
  level: 'A Level',
  intro: 'Health and Social Care explanations for lifespan development, care values, communication and safeguarding. Most were made for BTEC, which covers the same content. Videos play here in Forge.',
  heading: 'OCR H125 · Alan’s lessons, tutor2u and others',
  groups: [
    { title: 'Human lifespan development', videos: [
      v('fxrTCveqPYE', 'Life stages and PIES', 'Lifespan development', AL),
      v('cwEJybH5CZk', 'PIES growth and development across the life stages', 'Lifespan development', T2U),
      v('mqno2JTTNUM', 'Nature versus nurture and genetic factors', 'Lifespan development', AL),
      v('ZMoykY_WDY0', 'Genetic, environmental and social factors', 'Lifespan development', AL),
      v('COJAWmJrWOc', 'Major life events', 'Lifespan development', AL),
    ] },
    { title: 'Care values, communication and safeguarding', videos: [
      v('Ptg5YCupLZc', 'Person-centred values', 'Care values', 'JustLearnIt (OCR GCSE)'),
      v('h20SIhv2Fdw', 'The person-centred approach', 'Care values', T2U),
      v('2Sv0NntfJkw', 'Health and social care workers and their roles', 'Care values', T2U),
      v('Hx29dL6s_NI', 'Argyle’s communication cycle', 'Communication', 'Inspire London College'),
      v('K1B06RBRmT8', 'Communication in health and social care', 'Communication', 'SLN Connect'),
      v('oWTxt16L75s', 'Safeguarding adults and children', 'Safeguarding', 'Leeds and York PFT'),
    ] },
  ],
};
