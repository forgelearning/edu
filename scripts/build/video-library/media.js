const mf = (id, title, area) => ({ id, title, tag: `${area} · Mrs Fisher` });

module.exports = {
  slug: 'media',
  name: 'Media Studies',
  level: 'A Level',
  intro: 'Eduqas A-level Media Studies: short guides to every theorist in the theoretical framework. Videos open on YouTube.',
  heading: 'Eduqas A680QS · Mrs Fisher',
  groups: [
    { title: 'Media language', videos: [
      mf('bow0Y9QUlBU', 'Barthes: semiotics', 'Media language'),
      mf('CuEdncp5XfM', 'Todorov: narratology', 'Media language'),
      mf('xJJRyPIsD9Q', 'Lévi-Strauss: binary oppositions', 'Media language'),
      mf('hNaDStRuPdI', 'Neale: genre theory', 'Media language'),
      mf('KNd-qSF698A', 'Baudrillard: postmodernism', 'Media language'),
    ] },
    { title: 'Representation', videos: [
      mf('HxK5CXfKSCI', 'Hall: representation', 'Representation'),
      mf('tTRk3Y6BnqA', 'Gauntlett: identity', 'Representation'),
      mf('GzAJCoU9dLk', 'Gilroy: postcolonial theory', 'Representation'),
      mf('cywJ3GHCruk', 'bell hooks: feminist theory', 'Representation'),
      mf('73GzwfKFqXc', 'van Zoonen: feminist theory', 'Representation'),
      mf('stFSvVYJ_tk', 'Butler: gender performativity', 'Representation'),
    ] },
    { title: 'Media industries', videos: [
      mf('KUteUbVS5DA', 'Curran and Seaton: power and media industries', 'Industries'),
      mf('xD4LDiDAmIM', 'Hesmondhalgh: cultural industries', 'Industries'),
      mf('hanh0Lwl8UI', 'Livingstone and Lunt: regulation', 'Industries'),
    ] },
    { title: 'Audiences', videos: [
      mf('_YBK4LoGBJQ', 'Bandura: media effects', 'Audiences'),
      mf('7JhbgHIVdnE', 'Gerbner: cultivation theory', 'Audiences'),
      mf('U7RO60SkDbw', 'Hall: reception theory', 'Audiences'),
      mf('Eo3_q9KFY0U', 'Jenkins: fandom', 'Audiences'),
      mf('u8rFe2Z60Hg', 'Shirky: the end of audience', 'Audiences'),
    ] },
  ],
};
