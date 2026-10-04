import { glyphOf } from './glyph-of.ts';

/**
 * Returns the width of a text in native pixels at a scale, one pixel of spacing between glyphs.
 * @example
 * textWidth('PRÊTE'); // 19
 * textWidth('42', 2); // 14
 */
export function textWidth(text: string, scale = 1): number {
  let width = 0;
  for (const ch of text) width += ((glyphOf(ch).rows[0]?.length ?? 0) + 1) * scale;

  return Math.max(0, width - scale);
}
