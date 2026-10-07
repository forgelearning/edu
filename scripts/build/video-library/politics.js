const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const PEBL = 'PEBL Lessons';
const PE = 'Politics Explained';
const AHN = 'Alan History Nerd';

module.exports = {
  slug: 'politics',
  name: 'Politics',
  level: 'A Level',
  intro: 'Edexcel A-level Politics explanations for UK politics, UK government, ideas and US politics. Videos open on YouTube.',
  heading: 'Edexcel 9PL0 · PEBL Lessons, Politics Explained and others',
  groups: [
    { title: 'UK politics', videos: [
      v('ZbQzjkNs_C0', 'Democracy and participation', 1, PEBL),
      v('7q0Lsnx9Qgg', 'First past the post', 1, 'The Learning Academy Education'),
      v('qrsIAdKPLcs', 'Political parties', 1, PEBL),
      v('4mDUQTfLpqw', 'Pressure groups', 1, AHN),
    ] },
    { title: 'Core political ideas', videos: [
      v('cLMGS33OqrA', 'Conservatism', 1, PEBL),
      v('Ybm1M6NR1do', 'Liberalism in 10 minutes', 1, PE),
      v('seUKhAHpVfw', 'Socialism in 10 minutes', 1, PE),
    ] },
    { title: 'UK government', videos: [
      v('FzE0JK3wKHk', 'The UK constitution', 2, PEBL),
      v('Z-p4H_cVhUQ', 'The UK Parliament', 2, PEBL),
      v('JPBNJ_bzUIU', 'The legislative process: Commons and Lords', 2, PE),
      v('4x_wPyYoHZU', 'The Prime Minister and the executive', 2, PEBL),
      v('z6G7pkHFROo', 'The role of the Supreme Court', 2, 'The Learning Academy Education'),
      v('qxWgFOQ-BG8', 'Feminism', 2, PEBL),
    ] },
    { title: 'US politics', videos: [
      v('ifP6cVdf8x0', 'The US Constitution and federalism', 3, PEBL),
      v('tD96JJKuueY', 'The structure of Congress', 3, PE),
      v('_tJNFiLxHA4', 'The US presidency', 3, PEBL),
      v('Oe95bLmllE0', 'The President and Congress', 3, AHN),
      v('8HCIOq12244', 'The Supreme Court and civil rights', 3, PEBL),
      v('BhqpHXhvmCE', 'Supreme Court appointments', 3, PE),
      v('9mRHf4SUKzU', 'Presidential elections and the Electoral College', 3, PE),
    ] },
  ],
};
