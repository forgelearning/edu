// Combined Science reuses the three separate-science lists, minus the videos
// marked `triple` (content only in the separate-science specifications), so a
// video is added or replaced in one place.
const sciences = [
  ['Biology', require('./gcse-biology')],
  ['Chemistry', require('./gcse-chemistry')],
  ['Physics', require('./gcse-physics')],
];

module.exports = {
  slug: 'gcse-combined-science',
  name: 'Combined Science',
  level: 'GCSE',
  intro: 'Edexcel GCSE Combined Science explanations for Biology, Chemistry and Physics. Videos open on YouTube.',
  heading: 'Edexcel 1SC0 · Freesciencelessons and Cognito',
  groups: sciences.flatMap(([science, subject]) => subject.groups
    .map((g) => ({ title: `${science}: ${g.title.charAt(0).toLowerCase()}${g.title.slice(1)}`, videos: g.videos.filter((v) => !v.triple) }))
    .filter((g) => g.videos.length)),
};
