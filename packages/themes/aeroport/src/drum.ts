/**
 * The letters on a split-flap cell's drum, in the order the flaps fall. A Solari module can only show what is
 * printed on its drum, so every word the board flips must be spelt with these.
 */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÇÉÈÊËÎÏÔÙÛÜ0123456789:'.,!?-+/%&€$£#×";

/**
 * Returns `text` as the drum can show it: in capitals, an accented letter the drum lacks written without its
 * accent, any other missing character left blank.
 * @example
 * onDrum('Revue approuvée'); // "REVUE APPROUVÉE"
 * onDrum('naïve « idée »'); // "NAÏVE   IDÉE  "
 * onDrum('Ōsaka'); // "OSAKA"
 */
export function onDrum(text: string): string {
  const letters = new Intl.Segmenter('fr', { granularity: 'grapheme' }).segment(text.normalize('NFC').toUpperCase());

  return Array.from(letters, ({ segment }) => drumLetter(segment)).join('');
}

/**
 * Returns one character as the drum can show it.
 * @example
 * drumLetter('Ō'); // "O"
 * drumLetter('@'); // " "
 */
function drumLetter(char: string): string {
  if (DRUM.includes(char)) return char;

  const bare = char.normalize('NFD').replace(/\p{M}/gu, '');

  return bare.length === 1 && DRUM.includes(bare) ? bare : ' ';
}
