import { ALIASES } from './glyphs.ts';

/** The no-break spaces a number formatter writes between digit groups and before a unit. */
const NO_BREAK = new Set([' ', ' ']);

/**
 * Returns any text ready for the bitmap font: typographic quotes and dashes mapped to their plain glyph, capitals
 * with their accents, single spaces. A no-break space stays one, so a number never splits from its unit.
 * @example
 * plainText('Comptabilité : « Facture d’octobre »'); // "COMPTABILITÉ : « FACTURE D'OCTOBRE »"
 */
export function plainText(text: string): string {
  const mapped = Array.from(text, (ch) => (NO_BREAK.has(ch) ? ' ' : (ALIASES[ch] ?? ch))).join('');

  return mapped.toUpperCase().replace(/ +/g, ' ').trim();
}
