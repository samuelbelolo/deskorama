import { cutPoint } from './cut-point.ts';
import { textWidth } from './text-width.ts';

/** A word this long or shorter is never cut: the plaque looks for a wider block instead. */
const SHORT_WORD = 8;

/**
 * Wraps a text into rows that fit a width, word by word. A word of more than 8 letters that is too long is cut
 * between syllables ("INSTAL-" then "LÉE"); a shorter one never is. A no-break space keeps a number with its unit.
 * Null when more than `maxRows` rows are needed.
 * @example
 * wrapWords('APPLI INSTALLÉE', 28, 3); // { rows: ['APPLI', 'INSTAL-', 'LÉE'], cuts: 1 }
 * wrapWords('DEMANDE REFUSÉE', 28, 3); // null: DEMANDE is never cut
 */
export function wrapWords(text: string, width: number, maxRows: number): { rows: string[]; cuts: number } | null {
  const rows: string[] = [];
  let cuts = 0;
  let row = '';

  for (const word of text.split(' ')) {
    const candidate = row === '' ? word : `${row} ${word}`;
    if (textWidth(candidate) <= width) {
      row = candidate;
      continue;
    }

    if (row !== '') rows.push(row);
    row = word;
    const long = (word.match(/\p{L}/gu) ?? []).length > SHORT_WORD;

    while (textWidth(row) > width) {
      const cut = long ? cutPoint(row, (prefix) => textWidth(prefix) <= width) : 0;
      if (cut === 0) return null;
      rows.push(`${row.slice(0, cut)}-`);
      row = row.slice(cut);
      cuts += 1;
    }
  }

  if (row !== '') rows.push(row);

  return rows.length <= maxRows ? { rows, cuts } : null;
}
