import { ACCENTS, ALIASES, GLYPHS } from './glyphs.ts';

/**
 * Returns true when a character has a glyph of its own, an accent on one or an alias of one: false when it would be
 * drawn as its base letter or a question mark.
 * @example
 * hasGlyph('€'); // true
 * hasGlyph('¿'); // false
 */
export function hasGlyph(ch: string): boolean {
  const plain = ALIASES[ch] ?? ch;

  return ACCENTS[ch] !== undefined || GLYPHS[plain] !== undefined || GLYPHS[plain.toUpperCase()] !== undefined;
}
