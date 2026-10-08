const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const PB = 'Psych Boost';
const BIM = 'Bear it in MIND';
const SMC = 'SMCartledge';

module.exports = {
  slug: 'psychology',
  name: 'Psychology',
  level: 'A Level',
  intro: 'AQA A-level Psychology explanations for Papers 1 to 3, grouped by topic. Videos play here in Forge.',
  heading: 'AQA 7182 · Psych Boost, Bear it in MIND and SMCartledge',
  groups: [
    { title: 'Social influence', videos: [
      v('-x75l2QFTew', 'Asch and conformity', 1, PB),
      v('VLCLrnoWgbA', 'Milgram’s research into obedience', 1, SMC),
      v('PJd2RWX_1a4', 'Explanations for obedience: Milgram and Adorno', 1, PB),
    ] },
    { title: 'Memory', videos: [
      v('yw3CFPHFJTk', 'The multi-store model of memory', 1, PB),
      v('dqn5skNmi14', 'Factors affecting eyewitness testimony', 1, PB),
      v('-8Ed3308lOo', 'Improving eyewitness testimony: the cognitive interview', 1, PB),
    ] },
    { title: 'Attachment', videos: [
      v('kjdRnLy6mf4', 'Explanations of attachment', 1, PB),
      v('8W2ByR-PrWY', 'Bowlby’s theory of attachment', 1, SMC),
      v('HCylGX4oVQA', 'Ainsworth’s Strange Situation', 1, PB),
    ] },
    { title: 'Psychopathology', videos: [
      v('V02dwOgybmQ', 'Definitions of abnormality', 1, BIM),
      v('QLcAeo2UeRo', 'Characteristics of phobias, depression and OCD', 1, PB),
      v('XxRnoUckq0c', 'Explaining depression: the cognitive approach', 1, BIM),
      v('o_ZFn911v_I', 'Treating depression: CBT', 1, BIM),
      v('b2qOFW9RG2s', 'Biological explanations for OCD', 1, SMC),
    ] },
    { title: 'Approaches and biopsychology', videos: [
      v('DoEugxTZnt0', 'The behaviourist approach', 2, PB),
      v('n6SWcMtP8T4', 'The cognitive approach', 2, PB),
      v('5ptwfPaGvEY', 'Divisions of the nervous system', 2, PB),
      v('JAbbco1hh8s', 'The endocrine system', 2, PB),
      v('ichttGqxR6E', 'The fight-or-flight response', 2, BIM),
      v('Nu3fFB9rxKE', 'Localisation of function in the brain', 2, PB),
      v('BEdug0wAgd4', 'Split-brain research', 2, PB),
    ] },
    { title: 'Research methods', videos: [
      v('Fo7zq8WeVpc', 'Types of experiment', 2, PB),
      v('Y2t81H51S3I', 'Experimental design', 2, PB),
      v('ONixIr50Ml4', 'Distributions', 2, PB),
      v('fndlkimttBo', 'Choosing a statistical test', 2, SMC),
    ] },
    { title: 'Issues and debates', videos: [
      v('gss-M6m6zaQ', 'Issues and debates overview', 3, PB),
      v('MMcI-yoqsP8', 'Free will and determinism', 3, PB),
      v('cWaO2mB-0ME', 'Gender and culture bias', 3, PB),
    ] },
    { title: 'Paper 3 options: cognition, stress and forensic psychology', videos: [
      v('tAF-JCHv73Y', 'Cognition and development overview', 3, PB),
      v('YtLptr0jLsk', 'The role of stress in illness', 3, SMC),
      v('CL5UVzFWe74', 'Offender profiling', 3, PB),
      v('-fQd-NvAiHY', 'Forensic psychology overview', 3, PB),
    ] },
  ],
};
