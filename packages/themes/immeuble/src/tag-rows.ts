import { gluedWords } from './glued-words.ts';
import { plainText } from './plain-text.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns a short text (a prop's tag, a sign's heading) split at its spaces into rows that each fit a width, words
 * joined greedily and never cut; null when one word alone is too wide or more rows are needed than allowed.
 * @example
 * tagRows('70 PLACES', 30, 2); // ["70", "PLACES"]
 * tagRows('Prête', 40); // ["PRÊTE"]
 * tagRows('CONSTITUTIONNEL', 20); // null
 */
export function tagRows(text: string, width: number, maxRows = 2): string[] | null {
  const rows: string[] = [];

  for (const word of gluedWords(plainText(text))) {
    if (textWidth(word) > width) return null;

    const last = rows.at(-1);
    const joined = last === undefined ? word : `${last} ${word}`;
    if (last !== undefined && textWidth(joined) <= width) rows[rows.length - 1] = joined;
    else rows.push(word);
  }

  return rows.length <= maxRows ? rows : null;
}
