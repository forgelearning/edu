const v = (id, title, theme, channel) => ({ id, title, tag: `${theme} · ${channel}` });
const SB = 'Saint Ben RS Revision';

module.exports = {
  slug: 'religious-studies',
  subjects: ['rs'],
  name: 'Religious Studies',
  level: 'A Level',
  intro: 'Eduqas A-level Religious Studies explanations for Buddhism, philosophy of religion and religion and ethics. Videos play here in Forge.',
  heading: 'Eduqas A120QS · Saint Ben RS Revision and others',
  groups: [
    { title: 'Buddhism', videos: [
      v('VBCH9q87_I4', 'The life of the Buddha, the Four Noble Truths and the Eightfold Path', 'Component 1', 'Ben Wardle'),
      v('lr5PyWBCun8', 'Buddhist beliefs and teachings', 'Component 1', 'Revise Philosophy'),
    ] },
    { title: 'Philosophy of religion', videos: [
      v('XN7v1FSTL38', 'Cosmological arguments', 'Theme 1A', SB),
      v('QrxDc3_F0Eo', 'Teleological arguments', 'Theme 1B', SB),
      v('uM9aQPLU13A', 'Anselm’s ontological argument', 'Theme 1D', SB),
      v('EpymG2yhuq8', 'The problem of evil: Augustine, Irenaeus and Hick', 'Theme 2', 'The Rational Mind'),
      v('ZQu3W5aZrpc', 'Religious experience', 'Theme 3', 'Revise Philosophy'),
      v('rzfyP3E3dlI', 'Evaluating religious language', 'Theme 4', SB),
    ] },
    { title: 'Religion and ethics: ethical thought', videos: [
      v('srWgLYjovCE', 'Divine command theory', 'Theme 1A', SB),
      v('Jy-xQg7KKgw', 'Virtue ethics', 'Theme 1B', SB),
      v('4BhGHCdXs24', 'Meta-ethics: intuitionism', 'Theme 1E', SB),
      v('xmZVJ8mTQug', 'Meta-ethics: emotivism', 'Theme 1F', SB),
    ] },
    { title: 'Religion and ethics: normative theories and free will', videos: [
      v('_3QyAnc9FQo', 'Aquinas’ natural law', 'Theme 2B', SB),
      v('3i3CmtF3Whs', 'Finnis’ natural law', 'Theme 2D', SB),
      v('u3lpeZh-r90', 'Situation ethics', 'Theme 3B', SB),
      v('rwu07f04KBU', 'Bentham’s utilitarianism', 'Theme 3D', SB),
      v('2UhmMCUPlRE', 'Mill’s utilitarianism', 'Theme 3E', SB),
      v('2VYm6XgU2xc', 'Free will and determinism', 'Theme 4C', SB),
    ] },
  ],
};
