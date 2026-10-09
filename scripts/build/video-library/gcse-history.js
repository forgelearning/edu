const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const IS = 'I’m Stuck';
const HRS = 'History Revision Success';
const CLOKE = 'MrClokeHistory';

module.exports = {
  slug: 'gcse-history',
  subjects: ['gcse-hist'],
  name: 'History',
  level: 'GCSE',
  intro: 'AQA GCSE History explanations for America, Conflict and Tension, Health and the People, and Elizabethan England. Videos play here in Forge.',
  heading: 'AQA 8145 · MrClokeHistory and others',
  groups: [
    { title: 'America, 1920–1973: opportunity and inequality', videos: [
      v('632xI-wfD68', 'Causes of the 1920s boom', 1, IS),
      v('DcTn7wh5TfM', 'Prohibition', 1, HRS),
      v('uvOKARPUYTI', 'Hoover and the Great Depression', 1, HRS),
      v('6McAQKarV1U', 'The New Deal', 1, HRS),
      v('B99LM69jfcM', 'The civil rights movement: ways of protesting', 1, IS),
      v('rI5AC8B4j38', 'The New Frontier and the Great Society', 1, 'HisTV'),
    ] },
    { title: 'Conflict and tension, 1918–1939', videos: [
      v('L-xL62P4SoI', 'The Big Three', 1, 'Pete Jackson'),
      v('v2xTKTKwZJs', 'The Treaty of Versailles', 1, 'Pete Jackson'),
      v('W9fN68QMOXI', 'The League of Nations and the Manchurian crisis', 1, 'ONE History Help'),
      v('rjTrCFNQhEc', 'The Abyssinian crisis', 1, 'Mr Kidd - History'),
      v('oNhkAI26weg', 'Appeasement and the road to war', 1, 'Homeschool History'),
    ] },
    { title: 'Health and the people, c1000 to the present day', videos: [
      v('glJcvFgaGyU', 'Medieval health', 2, 'Mr Slone History'),
      v('WF1ydUYAKWo', 'The Renaissance: Vesalius, Paré and Harvey', 2, 'Lessons in History'),
      v('oMNIQ_0_yCI', 'Louis Pasteur and germ theory', 2, CLOKE),
      v('ZmaoHB5fKB4', 'Pasteur and Koch', 2, 'BBC Bitesize'),
      v('pb76WtsccAk', 'The origins of the NHS', 2, CLOKE),
    ] },
    { title: 'Elizabethan England, c1568–1603', videos: [
      v('J4luTCHc-tc', 'The religious settlement', 2, CLOKE),
      v('d0Rd-ACWPGo', 'Elizabethan attitudes to the poor', 2, CLOKE),
      v('yMEbW6BHYzU', 'Mary, Queen of Scots', 2, CLOKE),
      v('q1etLovNOaY', 'The Spanish Armada', 2, CLOKE),
    ] },
  ],
};
