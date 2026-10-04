import { ACCENTS, ALIASES, GLYPHS } from './glyphs.ts';

/** How one character is drawn: its pixel rows and the accent pixels around them. */
export interface Glyph {
  readonly rows: readonly string[];
  readonly marks: readonly (readonly [number, number])[];
}

/** The glyph of a character the font does not know. */
const UNKNOWN: Glyph = { rows: GLYPHS['?'] ?? [], marks: [] };

/**
 * Returns how a character is drawn: its own glyph, an accented capital, an alias, the capital of a lowercase
 * letter, the base letter of any other accented letter, or a question mark.
 * @example
 * glyphOf('É').marks; // [[2, -3], [1, -2]]
 * glyphOf('ñ').rows; // the rows of "N"
 */
export function glyphOf(ch: string): Glyph {
  const accent = ACCENTS[ch];
  if (accent !== undefined) return { rows: GLYPHS[accent.base] ?? UNKNOWN.rows, marks: accent.marks };

  const plain = ALIASES[ch] ?? ch;
  const base = plain.normalize('NFD').charAt(0).toUpperCase();
  const rows = GLYPHS[plain] ?? GLYPHS[plain.toUpperCase()] ?? GLYPHS[base];

  return rows === undefined ? UNKNOWN : { rows, marks: [] };
}
