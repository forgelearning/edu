const v = (id, title, paper, channel) => ({ id, title, tag: `Paper ${paper} · ${channel}` });
const PEBL = 'PEBL Lessons';
const ANNA = 'LawWithAnna';
const ALLT = 'The A Level Law Teacher';

module.exports = {
  slug: 'law',
  name: 'Law',
  level: 'A Level',
  intro: 'OCR A-level Law explanations for the legal system, criminal law, tort and contract. Videos play here in Forge.',
  heading: 'OCR H418 · PEBL Lessons, LawWithAnna and others',
  groups: [
    { title: 'The legal system and law making', videos: [
      v('UfCpYFwDi0I', 'Juries', 1, ALLT),
      v('zuBsvP1aBeI', 'Judicial precedent', 2, PEBL),
      v('qdkhuEw-XTU', 'Statutory interpretation', 2, PEBL),
    ] },
    { title: 'Criminal law', videos: [
      v('obnpurtO-6w', 'Actus reus and mens rea', 1, 'Ace A Level Law'),
      v('19PMlmlv4lA', 'Fatal offences against the person', 1, PEBL),
      v('7WEikaFrcIE', 'Involuntary manslaughter', 1, ANNA),
      v('aSRY5zFx1T8', 'Non-fatal offences against the person', 1, PEBL),
      v('fC6T7t1uZuE', 'Insanity and automatism', 1, 'tutor2u'),
      v('-xfQyE4pn_c', 'Theft', 1, ANNA),
    ] },
    { title: 'Law of tort', videos: [
      v('TbGUiuqfYQ8', 'Negligence: duty and breach', 2, ANNA),
      v('ykHpdWrtLDg', 'Occupiers’ liability', 2, PEBL),
    ] },
    { title: 'Law of contract', videos: [
      v('Wae7bIScc-8', 'Offer and acceptance', 3, ANNA),
      v('fJdyJ6OgoU0', 'Consideration', 3, ANNA),
      v('eRLReiCxOBg', 'Intention to create legal relations', 3, ALLT),
      v('XSUaMamXsOQ', 'Terms of a contract', 3, PEBL),
    ] },
  ],
};
