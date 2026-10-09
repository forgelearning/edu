const v = (id, title, theme, channel) => ({ id, title, tag: `Theme ${theme} · ${channel}` });
const TTB = 'TakingTheBiz';
const BIZ = 'Bizconsesh';
const BAU = 'Business As Usual';

module.exports = {
  slug: 'business',
  subjects: ['bus'],
  name: 'Business',
  level: 'A Level',
  intro: 'Edexcel A-level Business explanations for Themes 1 to 4. Videos play here in Forge.',
  heading: 'Edexcel 9BS0 · TakingTheBiz, Bizconsesh and others',
  groups: [
    { title: 'Marketing and people', videos: [
      v('ZTcsyyFdVGM', 'Price elasticity of demand', 1, BIZ),
      v('vXcfMpPRT48', 'The marketing mix', 1, BAU),
      v('lwbjAPiDp9c', 'Motivation theory', 1, TTB),
      v('nMfPAR_N1Do', 'Herzberg’s two-factor theory', 1, TTB),
      v('OlmmdMm52pQ', 'Leadership styles', 1, TTB),
    ] },
    { title: 'Managing business activities', videos: [
      v('578qM7sXo_M', 'Break-even', 2, TTB),
      v('PnSUwXt4enE', 'Break-even diagrams', 2, TTB),
      v('77DRCnSnbbQ', 'Cash-flow forecasts', 2, TTB),
      v('vrvJmJfOavE', 'Profit margin ratios', 2, BIZ),
      v('PEZGGsi_dDE', 'Lean production', 2, 'tutor2u'),
    ] },
    { title: 'Business decisions and strategy', videos: [
      v('OhqMt_3A2WY', 'Ansoff’s matrix', 3, TTB),
      v('Lkg5TVlC6dY', 'Porter’s generic strategies', 3, TTB),
      v('1Px2U0rprSs', 'Decision trees', 3, TTB),
      v('teg0avCfFfI', 'Investment appraisal: payback', 3, TTB),
      v('rZgaogeoynU', 'Investment appraisal: average rate of return', 3, TTB),
      v('aj20v1P5vRQ', 'Investment appraisal: net present value', 3, TTB),
      v('lKWOQYpQNw0', 'The current ratio', 3, TTB),
      v('3offFagEWKg', 'The gearing ratio', 3, TTB),
      v('FIfm_RW1U-U', 'Managing change', 3, BAU),
    ] },
    { title: 'Global business', videos: [
      v('w3ohMzkTdpk', 'Globalisation', 4, TTB),
      v('nbmTCfWPabE', 'Globalisation recap', 4, BAU),
      v('Gcf7RKigZSs', 'Multinationals', 4, 'tutor2u'),
    ] },
  ],
};
