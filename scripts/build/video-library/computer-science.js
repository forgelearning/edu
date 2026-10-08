// Craig'n'Dave number their A-level series by the OCR specification. The
// content matches Eduqas, so the tags give the Eduqas component instead and
// say whose series the video comes from.
const cd = (id, title, component) => ({ id, title, tag: `Component ${component} · Craig’n’Dave (OCR series)` });

module.exports = {
  slug: 'computer-science',
  name: 'Computer Science',
  level: 'A Level',
  intro: 'Eduqas A-level Computer Science explanations for Components 1 and 2. Videos play here in Forge.',
  heading: 'Eduqas A500QS · Craig’n’Dave',
  groups: [
    { title: 'Programming and software development', videos: [
      cd('9u2XQ1G5DVY', 'Object-oriented programming, part 1', 1),
      cd('HmVLvdgbVGE', 'Object-oriented programming, part 2', 1),
      cd('N61yojktcH8', 'Recursion', 1),
      cd('qEmrXu8d1ys', 'Software development methodologies', 1),
    ] },
    { title: 'Data structures and logic', videos: [
      cd('_7_jYMk_R9k', 'Stacks and queues', 1),
      cd('sdO9cPdgVAk', 'Linked lists', 1),
      cd('iPEVk0WrV_A', 'Defining problems using Boolean logic', 1),
      cd('43MVorZRtE0', 'Simplifying Boolean algebra', 1),
    ] },
    { title: 'Algorithms', videos: [
      cd('BdjaHVIvJGs', 'Linear search', 1),
      cd('pKW-hwvD2-A', 'Binary search', 1),
      cd('ih-gRQYc_84', 'Bubble sort', 1),
      cd('SpnnvFhSD8w', 'Insertion sort', 1),
      cd('7HefiVVtz5Y', 'Quick sort', 1),
      cd('A8aUjcULkLI', 'Measuring the efficiency of algorithms', 1),
      cd('IILaLg98xW0', 'Big O notation in practice', 1),
      cd('YHDmA7ZlwqU', 'Dijkstra’s shortest path', 1),
    ] },
    { title: 'Hardware and the operating system', videos: [
      cd('Y4O2-ilSw-o', 'The fetch–decode–execute cycle', 2),
      cd('8aFBYlR_CYw', 'The need for operating systems', 2),
      cd('O4nwUqQodAg', 'Paging, segmentation and virtual memory', 2),
    ] },
    { title: 'Data representation, communication and databases', videos: [
      cd('LS8ZANp1Yp8', 'Two’s complement', 2),
      cd('mGfOJQgdI_U', 'Floating-point binary', 2),
      cd('IGQ9YOnhWxA', 'Normalising floating-point numbers', 2),
      cd('H5jGQingnWI', 'TCP/IP, DNS and protocol layers', 2),
      cd('xMQlMdXlu-A', 'Lossy and lossless compression', 2),
      cd('UYqMu0PqeCE', 'Symmetric and asymmetric encryption', 2),
      cd('UY3zc9G_YZo', 'Database normalisation to 3NF', 2),
    ] },
  ],
};
