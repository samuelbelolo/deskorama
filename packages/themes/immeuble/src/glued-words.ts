/**
 * Returns a text split at its spaces, keeping a currency sign with its amount and the digit groups of a number
 * together, so a row never starts with a lone "€" or "100".
 * @example
 * gluedWords('T3 1100 €'); // ["T3", "1100 €"]
 * gluedWords('+1 250 €'); // ["+1 250 €"]
 */
export function gluedWords(text: string): string[] {
  const out: string[] = [];

  for (const word of text.split(' ').filter((part) => part !== '')) {
    const last = out.at(-1);
    const unit = /^[€$£%]+$/.test(word);
    const group = /^\d{3}$/.test(word) && /^[+\-€$£]?\d{1,3}( \d{3})*$/.test(last ?? '');

    if (last !== undefined && (unit || group)) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }

  return out;
}
