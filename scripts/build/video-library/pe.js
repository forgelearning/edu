const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const SPO = 'Super PE Online';
const EL = 'The EverLearner';
const APT = 'The A Level PE Tutor';
const JM = 'James Morris';

module.exports = {
  slug: 'pe',
  subjects: ['pe'],
  name: 'Physical Education',
  level: 'A Level',
  intro: 'AQA A-level PE explanations for anatomy and physiology, exercise physiology, biomechanics, skill and sport psychology. Videos play here in Forge.',
  heading: 'AQA 7582 · Super PE Online, The EverLearner and others',
  groups: [
    { title: 'Applied anatomy and physiology', videos: [
      v('kSmydYMD-co', 'The musculo-skeletal system and movement analysis', 1, SPO),
      v('8RTJH_BPP60', 'The cardiovascular system', 1, SPO),
      v('OtLPAk7ONHM', 'The respiratory system', 1, SPO),
      v('2_wRUV1pyhs', 'Motor units and skeletal muscle contraction', 1, APT),
      v('psmOMBYTj5w', 'Muscle fibre types', 1, JM),
    ] },
    { title: 'Energy systems', videos: [
      v('PIrhiSJcapc', 'The three energy systems', 1, 'PE Buddy'),
      v('Ig9Z8trua1o', 'OBLA', 1, EL),
      v('BxFJDYLU50c', 'EPOC', 1, JM),
    ] },
    { title: 'Skill acquisition', videos: [
      v('nQerf28Dxx0', 'The characteristics of skill', 1, EL),
      v('ccTnnuYkP0g', 'Learning plateaus', 1, EL),
    ] },
    { title: 'Exercise physiology', videos: [
      v('rrPUJVZ9U90', 'Strength training methods', 2, EL),
      v('vGtN0l0zU_4', 'Acute and chronic injuries', 2, EL),
      v('Q4Rb1IpMs6c', 'Injury prevention', 2, EL),
    ] },
    { title: 'Biomechanical movement', videos: [
      v('VcXZAAORMl4', 'Newton’s laws of motion', 2, 'Wes Davis'),
      v('fqpS14EoA7M', 'Lever systems', 2, APT),
      v('YnS8jeldIIo', 'Projectile motion', 2, 'Damian Edwards - PE'),
      v('joPDM1ddFIE', 'Angular motion', 2, APT),
      v('jtT_pacfyHk', 'The Bernoulli principle', 2, APT),
    ] },
    { title: 'Sport psychology', videos: [
      v('_Sziyxn4pLw', 'Attitudes', 2, JM),
      v('MtKOV5sXuXg', 'Attribution theory', 2, 'Planet PE'),
    ] },
  ],
};
