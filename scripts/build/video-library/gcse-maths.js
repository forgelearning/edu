const cm = (id, title, tier) => ({ id, title, tag: `${tier} · Corbettmaths` });
const F = 'Foundation and Higher';
const H = 'Higher';

module.exports = {
  slug: 'gcse-maths',
  name: 'Maths',
  level: 'GCSE',
  intro: 'Edexcel GCSE Maths explanations, grouped by topic. Videos open on YouTube.',
  heading: 'Edexcel 1MA1 · Corbettmaths',
  groups: [
    { title: 'Number', videos: [
      cm('oK-EFDLeEqc', 'HCF and LCM using products of primes', F),
      cm('lalcQLW6MWE', 'Adding and subtracting fractions', F),
      cm('KZbKYokJ3SQ', 'Recurring decimals to fractions', H),
      cm('ozuXy8_NZcg', 'Laws of indices', F),
      cm('cxGyZ3Yx9ow', 'Standard form', F),
      cm('ndU_cCbPAm4', 'Surds', H),
      cm('FQ8IFKNhphM', 'Error intervals', F),
    ] },
    { title: 'Algebra', videos: [
      cm('nUxCCVox-Zo', 'Expanding two brackets', F),
      cm('X-djBcWVizM', 'Factorising quadratics', F),
      cm('30S7WxKcPwg', 'Solving equations', F),
      cm('8U9u_itcs7k', 'Changing the subject of a formula', F),
      cm('3J0ccr74LcU', 'The quadratic formula', H),
      cm('VS6apvTv2Rc', 'Completing the square', H),
      cm('phlus4x0UqM', 'Simultaneous equations by elimination', F),
      cm('-YcE_D78fGE', 'Solving inequalities', F),
      cm('qnVVTBAfNu4', 'The nth term', F),
      cm('HdlnBX82jxI', 'The equation of a straight line', F),
      cm('u1YQVzrgYDg', 'Composite functions', H),
      cm('zpF9nbjResY', 'Inverse functions', H),
      cm('eWP15jyatIo', 'Iteration', H),
    ] },
    { title: 'Ratio, proportion and rates of change', videos: [
      cm('cflZnf9H5l4', 'Sharing in a ratio', F),
      cm('aG5zkrCiQpM', 'Reverse percentages', F),
      cm('FBCs95Co_oU', 'Compound interest', F),
      cm('kcOwC7uqJNE', 'Direct proportion', H),
      cm('dHVK7IeLGT8', 'Speed, distance and time', F),
    ] },
    { title: 'Geometry and measures', videos: [
      cm('Of8p1SfOcR0', 'Area of a circle', F),
      cm('ExALFZ3mP0Y', 'Volume of a cylinder', F),
      cm('iWLVTy_rGjs', 'Pythagoras’ theorem', F),
      cm('WWf3MnQ1SwU', 'Introduction to trigonometry', F),
      cm('ISxiacGy6oA', 'The sine rule: finding angles', H),
      cm('3H3u92WJAjw', 'The cosine rule', H),
      cm('L6DLoBMknoY', 'Similar shapes: missing sides', F),
      cm('u2EgwMYwibw', 'Describing enlargements', F),
      cm('vgMSLsos7Ew', 'Circle theorems', H),
      cm('xOdkldbusy0', 'Vectors', H),
    ] },
    { title: 'Probability and statistics', videos: [
      cm('PYEvSuz1Dxo', 'Tree diagrams', F),
      cm('xwK--rNDI9E', 'Venn diagrams', F),
      cm('zGbCFis_XpI', 'Means from frequency tables', F),
      cm('DwM6MrGq1h4', 'Reading cumulative frequency graphs', H),
      cm('VYa31tlstr0', 'Reading histograms', H),
    ] },
  ],
};
