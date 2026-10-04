/** The words a shortened label may drop in front and may not end on, separated by spaces. */
export interface ShortWords {
  readonly lead: string;
  readonly trail: string;
}

/**
 * Returns a label cut to `cells` at a word boundary: a leading "new" word goes first, the cut never ends on a
 * small word nor on a colon, and a single word too long for the field is cut mid-word.
 * @example
 * shortenLabel('NOUVELLE INSCRIPTION', 16, textFor('fr').board); // "INSCRIPTION"
 * shortenLabel('ROBOT BLOQUÉ PAR LE CAPTCHA', 16, textFor('fr').board); // "ROBOT BLOQUÉ"
 * shortenLabel('PULL REQUEST MERGED', 16, textFor('en').board); // "PULL REQUEST"
 */
export function shortenLabel(label: string, cells: number, words: ShortWords): string {
  const lead = new Set(words.lead.split(' '));
  const trail = new Set(words.trail.split(' '));
  const all = label.split(' ').filter((word) => word !== '');

  const first = all[0];
  if (all.length > 1 && first !== undefined && lead.has(first)) all.shift();

  const kept: string[] = [];
  for (const word of all) {
    if ([...kept, word].join(' ').length > cells) break;
    kept.push(word);
  }

  while (kept.length > 1 && trail.has(kept.at(-1) ?? '')) kept.pop();

  const cut = kept.length === 0 ? (all[0] ?? '').slice(0, cells) : kept.join(' ');

  return cut.replace(/\s*:$/, '');
}
