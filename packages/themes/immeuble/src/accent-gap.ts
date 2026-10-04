/** Capitals whose accent rises above the cap height. */
const UPPER_ACCENTS = /[ÉÈÊËÀÂÁÄÔÓÖÎÏÍÛÙÜÚ]/;

/**
 * Returns the extra pixels a stacked row needs under the row above it: 2 when it carries an accent above its
 * capitals, or when the row above has a cedilla hanging below, so the accent always reads with its own letter.
 * @example
 * accentGap('MISE EN LIGNE', 'RÉUSSIE'); // 2
 * accentGap('MISE EN', 'LIGNE'); // 0
 */
export function accentGap(above: string, row: string): number {
  return UPPER_ACCENTS.test(row) || above.includes('Ç') ? 2 : 0;
}
