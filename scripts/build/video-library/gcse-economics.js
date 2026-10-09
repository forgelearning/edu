const v = (id, title, paper) => ({ id, title, tag: `Paper ${paper} · Mr Goff` });

module.exports = {
  slug: 'gcse-economics',
  subjects: ['gcse-econ'],
  name: 'Economics',
  level: 'GCSE',
  intro: 'OCR GCSE Economics explanations for Papers 1 and 2. Videos play here in Forge.',
  heading: 'OCR J205 · Mr Goff',
  groups: [
    { title: 'Economic foundations', videos: [
      v('JD4TcX4biHw', 'The main economic groups and interdependence', 1),
      v('AGCrE9wi2nU', 'Factors of production', 1),
      v('5JgpjOxUcxM', 'Opportunity cost', 1),
      v('IxR4r97mEWQ', 'Specialisation and exchange', 1),
      v('YJ0U6q1XN4Y', 'Markets and types of economy', 1),
    ] },
    { title: 'Demand, supply and price', videos: [
      v('vElfqqD5l80', 'Introduction to demand', 1),
      v('usmqcjt3-No', 'Factors that shift demand', 1),
      v('_PFpS7Qdf5M', 'Introduction to supply', 1),
      v('Ot0I4JM013I', 'Price elasticity of demand', 1),
      v('A9lbqCP4rG0', 'Why elasticity of supply matters', 1),
    ] },
    { title: 'Competition, production, labour and money', videos: [
      v('iWTPWWIwVm4', 'Competition', 1),
      v('CJJQL5i_Z3E', 'Monopolies, oligopolies and competitive markets', 1),
      v('7oJg-4U4tqk', 'Production and productivity', 1),
      v('l3ePr-nKRn0', 'Costs, revenue, profit and loss', 1),
      v('HgROthjB0Xc', 'The labour market', 1),
      v('KSrnSMWJVlA', 'The financial sector', 1),
    ] },
    { title: 'Economic objectives', videos: [
      v('KwDRehC-dkI', 'Economic growth and GDP', 2),
      v('zE2PeHLzDGU', 'Employment and unemployment', 2),
      v('RjDFBck1hbo', 'Inflation', 2),
      v('H7r5VWBBEWc', 'The distribution of income', 2),
    ] },
    { title: 'Government policy and market failure', videos: [
      v('V729BKdq-i4', 'Fiscal policy', 2),
      v('FdKEf1zfNwc', 'Monetary policy', 2),
      v('u-BCYC4zELg', 'Supply-side policies', 2),
      v('fG-2FA3SyNA', 'Positive and negative externalities', 2),
    ] },
    { title: 'The international economy', videos: [
      v('3VW2aINotoA', 'International trade', 2),
      v('SNfHLKpfKDE', 'Exchange rates', 2),
      v('RxRbd5vvj-E', 'Globalisation', 2),
    ] },
  ],
};
