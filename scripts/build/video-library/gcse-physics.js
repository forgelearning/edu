// `triple: true` marks content that is in Edexcel 1PH0 (separate Physics) but
// not in 1SC0 (Combined Science); gcse-combined-science.js leaves those out.
const fsl = (id, title, topic, extra) => ({ id, title, tag: `Topic ${topic} · Freesciencelessons`, ...extra });
const triple = { triple: true };

module.exports = {
  slug: 'gcse-physics',
  name: 'Physics',
  level: 'GCSE',
  intro: 'Edexcel GCSE Physics explanations, grouped by topic. Videos open on YouTube.',
  heading: 'Edexcel 1PH0 · Freesciencelessons',
  groups: [
    { title: 'Motion and forces', videos: [
      fsl('P1lSWWUkMdQ', 'Scalar and vector quantities', 2),
      fsl('M_0FRIX8wIM', 'Speed', 2),
      fsl('r5iXzDCRMsE', 'Acceleration', 2),
      fsl('_W3VbonFNcw', 'Newton’s first law', 2),
      fsl('SqdCCxv9YzI', 'Newton’s second law', 2),
      fsl('wANmggaC9pY', 'Newton’s third law', 2),
      fsl('ZtQhlwPxE28', 'Momentum', 2),
      fsl('drMKdcMq3o0', 'Vehicle stopping distance', 2),
    ] },
    { title: 'Conservation of energy', videos: [
      fsl('-zy9eWzmGe4', 'Kinetic energy', 3),
      fsl('NI5jaeBrIgQ', 'Efficiency', 3),
      fsl('pqzvUur7QRw', 'Renewable energy resources', 3),
    ] },
    { title: 'Waves and the electromagnetic spectrum', videos: [
      fsl('0f5iYCNCnow', 'Transverse and longitudinal waves', 4),
      fsl('wO49W5lsP0s', 'Refraction of waves', 4),
      fsl('u5vkYjV1V1A', 'Electromagnetic waves', 5),
      fsl('L0iivb-acqU', 'Uses of electromagnetic waves', 5),
      fsl('KNUcS4NaqDw', 'Convex lenses', 5, triple),
    ] },
    { title: 'Radioactivity', videos: [
      fsl('nW0S1C6wVrg', 'Alpha, beta and gamma radiation', 6),
      fsl('xpSBhUpBXic', 'Nuclear equations', 6),
      fsl('wj9BzGFao8k', 'Half-life', 6),
    ] },
    { title: 'Astronomy', videos: [
      fsl('okMA18ppu98', 'Orbital motion', 7, triple),
      fsl('V0Y1JlVuin4', 'The life cycle of stars', 7, triple),
      fsl('C90DOE87TYc', 'Red-shift', 7, triple),
    ] },
    { title: 'Work, power and forces', videos: [
      fsl('JHEmPZ-YnrU', 'Work done by a force', 8),
      fsl('EDT0DPhaaMY', 'Calculating power', 8),
      fsl('0RXm47J196Q', 'Moments', 9, triple),
    ] },
    { title: 'Electricity and circuits', videos: [
      fsl('cx9xLwa7Gco', 'Resistance', 10),
      fsl('CEBfn4ndQWI', 'Current in series circuits', 10),
      fsl('JhBrAmQYr2g', 'Current in parallel circuits', 10),
      fsl('vJRXozSVTI8', 'Resistors in series and parallel', 10),
      fsl('fbu3o9wavHk', 'Mains electricity', 10),
      fsl('5obbfXg_MH4', 'Static electricity', 11, triple),
    ] },
    { title: 'Magnetism and electromagnetic induction', videos: [
      fsl('FodEDHaEY68', 'Magnetic fields', 12),
      fsl('dMbWkodL12I', 'Electromagnets', 12),
      fsl('GNLhSKZh-jM', 'The motor effect', 12),
      fsl('NjgqJahwsG0', 'The generator effect', 13),
      fsl('M9ytpIMB5d8', 'Transformers', 13),
    ] },
    { title: 'Particle model and forces and matter', videos: [
      fsl('-EZmXVOSa20', 'Density', 14),
      fsl('Hs5x0-IU2F4', 'Specific heat capacity', 14),
      fsl('x7GZ2DXef84', 'Specific latent heat', 14),
      fsl('hKO3DpgiISk', 'Particle motion in gases', 14),
      fsl('ACDbJ8rsQDo', 'Forces and elasticity', 15),
      fsl('P08-lYPy1hI', 'Pressure in fluids', 15, triple),
    ] },
  ],
};
