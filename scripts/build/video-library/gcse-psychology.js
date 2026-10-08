const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const PB = 'Psych Boost';
const PS = 'PsychSuccess';
const SHARPE = 'Mr Sharpe Psychology GCSE';

module.exports = {
  slug: 'gcse-psychology',
  name: 'Psychology',
  level: 'GCSE',
  intro: 'AQA GCSE Psychology explanations for Papers 1 and 2, grouped by topic. Videos play here in Forge.',
  heading: 'AQA 8182 · Psych Boost, PsychSuccess and others',
  groups: [
    { title: 'Memory', videos: [
      v('QTOZAsjpEhU', 'Memory overview', 1, PB),
      v('jr8peFkKz58', 'The multi-store model of memory', 1, PS),
      v('CqE5dgUE4qI', 'Key study: Bartlett and reconstructive memory', 1, PS),
    ] },
    { title: 'Perception', videos: [
      v('x-1U6jSG5lQ', 'Perception overview', 1, PB),
      v('KH7Hitiq3RE', 'Visual illusions', 1, SHARPE),
      v('sd_RCkgxO94', 'Gibson’s direct theory of perception', 1, PS),
      v('4brnXjLmtEU', 'Gregory’s constructivist theory of perception', 1, PS),
    ] },
    { title: 'Development', videos: [
      v('phSTGAN3EU4', 'Development overview', 1, PB),
      v('f5HoFE-TER0', 'Piaget’s theory of cognitive development', 1, PS),
      v('LD7aERKhlec', 'Learning styles and Willingham’s theory', 1, PS),
    ] },
    { title: 'Research methods', videos: [
      v('UGgHBMe3QV0', 'Research methods overview', 1, PB),
    ] },
    { title: 'Social influence', videos: [
      v('l0Md7_ruScs', 'Social influence overview', 2, PB),
      v('Y1lI3DaL95E', 'Conformity', 2, PS),
      v('lfICO2GbcIA', 'Obedience', 2, PS),
      v('XFItE_YNprA', 'Prosocial and bystander behaviour', 2, SHARPE),
    ] },
    { title: 'Language, thought and communication', videos: [
      v('Q6I1X91eWCM', 'Language, thought and communication overview', 2, PB),
      v('CWU0O9wknBs', 'The Sapir–Whorf hypothesis', 2, SHARPE),
    ] },
    { title: 'Brain and neuropsychology', videos: [
      v('0fN_5-ZgwrI', 'Brain and neuropsychology overview', 2, PB),
    ] },
    { title: 'Psychological problems', videos: [
      v('dY1ay7eREHc', 'Psychological problems overview', 2, PB),
      v('ZC3ytB8i94o', 'Depression: cognitive explanation and treatment', 2, PS),
      v('UtTK4jGUZdw', 'Depression: biological explanation and treatment', 2, PS),
      v('WQ7fjNB4ZJ4', 'Psychological explanation of addiction', 2, PS),
      v('Hf50C3iitVg', 'Kaij: a biological explanation of addiction', 2, PS),
    ] },
  ],
};
