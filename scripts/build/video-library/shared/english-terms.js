// Shared by english-literature.js and english-language-literature.js, which in
// Forge both draw on the ENG-TERM-1 terminology bank. Kept in a subfolder so
// the page builder does not mistake it for a subject.
const v = (id, title, channel) => ({ id, title, tag: `Terminology · ${channel}` });
const OSU = 'Oregon State University';

module.exports = {
  literaryTerms: { title: 'Literary terminology', videos: [
    v('S13Tg3RAUW4', 'Metre', OSU),
    v('YuXAbRAcvbw', 'Iambic pentameter', 'Dr Aidan'),
    v('yBn2ZOwv144', 'Enjambment', OSU),
    v('QmrKmL06J9g', 'The sonnet', OSU),
    v('ferWxPUN3ig', 'The dramatic monologue', OSU),
    v('q6e0oNVx8Uk', 'Irony', OSU),
    v('bCNNBxlnkjQ', 'The narrator', OSU),
    v('A-lDvHT2QyQ', 'The unreliable narrator', OSU),
    v('Vw5XclD9IlQ', 'Free indirect discourse', OSU),
    v('WaSFwO3O2SI', 'Stream of consciousness', OSU),
    v('isBKoIORntI', 'Motif', OSU),
    v('GR9VbSXxouM', 'Symbolism', OSU),
  ] },
};
