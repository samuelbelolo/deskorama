import { isSyllableBreak } from './is-syllable-break.ts';

/**
 * Returns where to cut a word so its first part and a hyphen fit: the last syllable break that fits, else the last
 * position that fits at all; 0 when not even two letters fit.
 * @example
 * cutPoint('SIMULATION', (prefix) => prefix.length <= 6); // 4, for "SIMU-"
 */
export function cutPoint(word: string, fits: (prefix: string) => boolean): number {
  let fallback = 0;

  for (let i = word.length - 2; i >= 2; i -= 1) {
    if (!fits(`${word.slice(0, i)}-`)) continue;
    if (isSyllableBreak(word, i)) return i;
    fallback = Math.max(fallback, i);
  }

  return fallback;
}
