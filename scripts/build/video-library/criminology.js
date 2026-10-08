const v = (id, title, unit, channel) => ({ id, title, tag: `Unit ${unit} · ${channel}` });
const T2U = 'tutor2u';

module.exports = {
  slug: 'criminology',
  name: 'Criminology',
  level: 'Other qualifications',
  intro: 'WJEC Level 3 Applied Criminology explanations for Units 1 to 4. Videos play here in Forge.',
  heading: 'WJEC Level 3 Applied Criminology · tutor2u and others',
  groups: [
    { title: 'Unit 1: Changing awareness of crime', videos: [
      v('nwxGEQIjgu0', 'State crime', 1, T2U),
      v('rn4Y31Ybpds', 'Hate crime', 1, T2U),
      v('GHbcvVcIAYg', 'Honour crime', 1, T2U),
      v('H4KfJawgSRU', 'Technological crime', 1, T2U),
      v('jbjiv8RxXb8', 'Procedural changes and unreported crime', 1, T2U),
      v('C_puzAL8yuU', 'Campaigns for change', 1, 'The Sociology and Criminology Teacher'),
    ] },
    { title: 'Unit 2: Criminological theories', videos: [
      v('xVVgqlW-fHg', 'Lombroso and atavistic form', 2, T2U),
      v('OJYpMpNmmFU', 'Freud’s psychodynamic theory', 2, T2U),
      v('FHhtqhVgiXU', 'Personality theory', 2, T2U),
      v('ftOuBdSXeIU', 'Learning theories', 2, T2U),
      v('to82RiEgYV0', 'Durkheim', 2, T2U),
      v('Uv4dflu8DKw', 'Merton’s strain theory', 2, T2U),
      v('Xo4mZ3MO7aA', 'Left realism', 2, T2U),
    ] },
    { title: 'Unit 3: From crime scene to courtroom', videos: [
      v('TbO4m3d0Juo', 'Crime scene investigators', 3, T2U),
      v('ewdKdud5hUg', 'Police officers and detectives', 3, T2U),
      v('o7Ppe6x3gbg', 'Profiling techniques', 3, T2U),
    ] },
    { title: 'Unit 4: Crime and punishment', videos: [
      v('YpEkbreAhmk', 'Government processes for law making', 4, T2U),
      v('QLr9vaZ_oJ8', 'The criminal justice system', 4, T2U),
      v('lWcB7_ws0Mo', 'The crime control model', 4, T2U),
      v('dyROyP1eS40', 'The due process model', 4, T2U),
      v('lSqKMGwS4SY', 'Internal forms of social control', 4, T2U),
      v('lO9PAqMQnaI', 'External forms of social control', 4, T2U),
      v('SW9YCQZKpPM', 'The aims of punishment', 4, 'Wil Sprenkel'),
    ] },
  ],
};
