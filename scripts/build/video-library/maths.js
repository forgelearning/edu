const tl = (id, title, part) => ({ id, title, tag: `${part} · TLMaths` });
const bicen = (id, title, part) => ({ id, title, tag: `${part} · Bicen Maths` });
const P1 = 'Pure Year 1';
const P2 = 'Pure Year 2';
const S1 = 'Statistics Year 1';
const S2 = 'Statistics Year 2';

module.exports = {
  slug: 'maths',
  name: 'Mathematics',
  level: 'A Level',
  intro: 'Edexcel A-level Maths explanations for Pure and Statistics. Videos open on YouTube.',
  heading: 'Edexcel 9MA0 · TLMaths and Bicen Maths',
  groups: [
    { title: 'Algebra and functions', videos: [
      tl('x25DsjbilsM', 'Rationalising the denominator', P1),
      tl('PUo0zoEdHl8', 'Using the discriminant', P1),
      tl('aSId_Kgjzfg', 'Simultaneous equations: one linear, one quadratic', P1),
      tl('9yl9gYoqlMw', 'Graph transformations: y = f(kx)', P1),
      tl('0Qdf8lYpWng', 'Partial fractions', P2),
      tl('sWlo7qZPFsw', 'The modulus function', P2),
      tl('5R1nu8rLees', 'Domain and range of an inverse function', P2),
    ] },
    { title: 'Proof, coordinate geometry and sequences', videos: [
      bicen('MfTmjQnGOA8', 'Proof by contradiction', P2),
      tl('G6C0lbELl2Y', 'The equation of a circle', P1),
      tl('Y0egyRdVWL8', 'Parametric equations', P2),
      tl('Bw-9_Rq2bp4', 'Binomial expansion: Pascal’s triangle and nCr', P1),
      bicen('5G7VKXarees', 'Sequences and series', P2),
    ] },
    { title: 'Trigonometry, exponentials and vectors', videos: [
      tl('-HAJ7VnzRrc', 'Proving trigonometric identities', P1),
      tl('nzGDeZS2FF0', 'Introducing radians', P2),
      bicen('EdN6irvBYqc', 'Exponentials and logarithms', P1),
      tl('iobbAP7-zvE', 'What is a vector?', P1),
      tl('6JLjLaK0UG0', 'Position vectors', P1),
    ] },
    { title: 'Differentiation', videos: [
      tl('nvDCkvc9Ldc', 'Differentiation from first principles', P1),
      tl('0u3ZEutUbe8', 'Stationary points', P1),
      tl('BIu0m2DObAA', 'The chain rule', P2),
      tl('eeXTgSniNiI', 'The product rule', P2),
      tl('GoxqlIrWNAY', 'The quotient rule', P2),
    ] },
    { title: 'Integration and numerical methods', videos: [
      tl('g__q9RkcOk8', 'Area between a curve and a line', P1),
      tl('GzEx5x_ph2g', 'Integration by substitution', P2),
      tl('MeHuy4OAuus', 'Integration by parts', P2),
      tl('3zueEN_CSOQ', 'The trapezium rule', P2),
      tl('ep8wI-p5Zbg', 'The Newton–Raphson method', P2),
    ] },
    { title: 'Statistics', videos: [
      tl('7W2E3YKZRZw', 'The large data set', S1),
      tl('ZBPCErzcgEw', 'The interquartile range', S1),
      tl('bbiVbYGOsPo', 'Regression lines', S1),
      tl('yDIrj7_eCM0', 'Introducing the binomial distribution', S1),
      bicen('z4kccxhR53k', 'Binomial hypothesis testing', S1),
      bicen('K1TihRcT0hU', 'Conditional probability', S2),
      tl('GREDEOsAO2A', 'Approximating a binomial with a normal distribution', S2),
      tl('u9qI49EG2UY', 'Hypothesis testing with the PMCC', S2),
    ] },
  ],
};
