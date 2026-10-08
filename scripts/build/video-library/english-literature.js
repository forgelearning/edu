const { literaryTerms } = require('./shared/english-terms');
const v = (id, title, channel) => ({ id, title, tag: `Exam technique · ${channel}` });

module.exports = {
  slug: 'english-literature',
  name: 'English Literature',
  level: 'A Level',
  intro: 'AQA A-level English Literature: literary terminology and exam technique. Videos play here in Forge.',
  heading: 'AQA 7712 · Mr Bruff, Oregon State University and others',
  groups: [
    literaryTerms,
    { title: 'Exam technique and the assessment objectives', videos: [
      v('VoC7_PXgzco', 'AO1 explained for A-level Literature', 'Mr Bruff'),
      v('_ih5W-H6tzo', 'Planning a literature essay', 'Mr Salles Teaches English'),
      v('Zrf2ij2hZiU', 'Writing introductions and conclusions', 'Mr Bruff'),
      v('4yAWudZ9Hc0', 'An example of A-level poetry analysis', 'Mr Bruff'),
      v('3yr7VSIgy9s', 'Analysing an unseen poem', 'Jen Chan'),
      v('6zDH0Y8uVVs', 'Using critical theory: feminist, psychoanalytic and Marxist readings', 'Jen Chan'),
    ] },
  ],
};
