import { textWidth } from './text-width.ts';

/** A Gauge's word and value laid side by side on one row of a sign. */
export interface FittedRow {
  readonly word: string;
  readonly value: string;
  readonly scale: number;
}

/** The space between a word and its value, in native pixels. */
const GAP = 4;

/**
 * Returns a Gauge's word and value that fit side by side in `room` native pixels: the first value that fits beside
 * the whole word, richest first (big digits, small digits, a compact number); else the last value beside the word
 * cut short with a dot. A value never overlaps its word.
 * @example
 * fitRow('COMMITS', [['12 345', 1], ['12 k', 1]], 50); // { word: 'COMMITS', value: '12 k', scale: 1 }
 * fitRow('DÉPLOIEMENTS', [['9', 1]], 50); // { word: 'DÉPLOIEM.', value: '9', scale: 1 }
 */
export function fitRow(word: string, values: readonly (readonly [string, number])[], room: number): FittedRow {
  for (const [value, scale] of values) {
    if (textWidth(word) + GAP + textWidth(value, scale) <= room) return { word, value, scale };
  }

  const [value, scale] = values.at(-1) ?? ['', 1];
  const left = room - GAP - textWidth(value, scale);
  let cut = word;
  while (cut.length > 1 && textWidth(`${cut}.`) > left) cut = cut.slice(0, -1);

  return { word: cut === word ? word : `${cut}.`, value, scale };
}
