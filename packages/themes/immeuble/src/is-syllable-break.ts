const VOWELS = new Set('AEIOUYÀÂÄÉÈÊËÎÏÔÖÛÙÜŒ');
const CLUSTERS = new Set(['CH', 'PH', 'TH', 'GN', 'QU']);
const LIQUID_LEAD = new Set('BCDFGKPTV');

/**
 * Returns true for a vowel, accented or not.
 * @example
 * vowel('É'); // true
 */
function vowel(ch: string): boolean {
  return VOWELS.has(ch);
}

/**
 * Returns true when a word may be cut before its letter `i` by French syllable rules: never inside CH, PH, TH, GN,
 * QU or a consonant followed by L or R, never leaving a single letter or a part without a vowel.
 * @example
 * isSyllableBreak('DEMANDE', 2); // true: DE-MANDE
 * isSyllableBreak('SIMULATION', 5); // false: SIMUL-ATION
 * isSyllableBreak('PAIEMENTS', 7); // false: "TS" has no vowel
 */
export function isSyllableBreak(word: string, i: number): boolean {
  if (i < 2 || word.length - i < 2) return false;

  const before = word.charAt(i - 1);
  const after = word.charAt(i);
  const next = word.charAt(i + 1);
  if (!Array.from(word.slice(0, i)).some(vowel) || !Array.from(word.slice(i)).some(vowel)) return false;

  if (vowel(before) && !vowel(after))
    return vowel(next) || (LIQUID_LEAD.has(after) && 'LR'.includes(next) && next !== '');
  if (vowel(before) || vowel(after)) return false;
  if (CLUSTERS.has(before + after)) return false;

  return !(LIQUID_LEAD.has(before) && 'LR'.includes(after));
}
