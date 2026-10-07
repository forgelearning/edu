const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const T2U = 'tutor2u';
const ESHER = 'Esher Sociology';

module.exports = {
  slug: 'sociology',
  name: 'Sociology',
  level: 'A Level',
  intro: 'AQA A-level Sociology explanations for Papers 1 to 3, grouped by topic. Videos open on YouTube.',
  heading: 'AQA 7192 · tutor2u and others',
  groups: [
    { title: 'Education', videos: [
      v('fwayfpdjtKE', 'Functionalism and education', 1, 'The Learning Academy Education'),
      v('-Za9RxbuPRk', 'Educational achievement: an overview', 1, 'all sociology'),
      v('iz_J8u2Hg68', 'Class and educational achievement', 1, 'all sociology'),
      v('L0XWCQcwGtQ', 'Ethnicity and educational achievement', 1, 'all sociology'),
      v('uPoSJAExU3k', 'Gender identity and educational achievement', 1, T2U),
    ] },
    { title: 'Theory and methods', videos: [
      v('4ZuZ1nrS2TM', 'Positivism', 1, T2U),
      v('F52ZnlUCzfk', 'Questionnaires', 1, T2U),
      v('7P4nURgH43A', 'Interviews', 1, T2U),
      v('cQOlpkI4mUg', 'What is feminism?', 3, T2U),
      v('rJFsMICL8F4', 'What is postmodernism?', 3, T2U),
    ] },
    { title: 'Families and households', videos: [
      v('pc8h1R9D5jw', 'Couples and the domestic division of labour', 2, ESHER),
      v('kwhNQDhvdrg', 'The social construction of childhood', 2, T2U),
      v('1BGtbnAsw_8', 'Is childhood disappearing?', 2, T2U),
      v('V4XFp0EzwEM', 'Demography: births, deaths and an ageing population', 2, ESHER),
      v('LHPAZT5NszU', 'Feminism and the family', 2, T2U),
    ] },
    { title: 'Beliefs in society', videos: [
      v('fRxPhVR2z6A', 'Secularisation', 2, T2U),
      v('yLSPSbH9BYg', 'Bruce on secularisation', 2, T2U),
      v('DltuK7yUlu0', 'Weber on religion', 2, T2U),
    ] },
    { title: 'Media, stratification and global development', videos: [
      v('UXKu7dDUZ4E', 'Media representations of gender', 2, T2U),
      v('83j7fvYrOuM', 'Media representations of social class', 2, T2U),
      v('pqeE08oGW-E', 'Life chances and social class', 2, T2U),
      v('7tE6DCRY7-E', 'Modernisation theory', 2, T2U),
      v('1OUdiUJtxsM', 'Dependency theory', 2, T2U),
    ] },
    { title: 'Crime and deviance', videos: [
      v('ZkiiRLSsOH4', 'Functionalist theories: Durkheim', 3, T2U),
      v('1Rnn-T2dxWc', 'Functionalist theories: Merton', 3, T2U),
      v('ZqZWUnM-0M8', 'Marxist theories: criminogenic capitalism', 3, T2U),
      v('RSlb69D7knk', 'Marxist theories: selective law enforcement', 3, T2U),
      v('rYFnUKT_YKI', 'Interactionist theories: Becker and labelling', 3, T2U),
    ] },
  ],
};
