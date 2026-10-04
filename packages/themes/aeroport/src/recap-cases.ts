import type { Language, Recap, RecapGroup } from '@deskorama/core';
import { countPhrase } from './count-phrase.ts';
import { freshTone } from './fresh-tone.ts';
import { moreCase } from './more-case.ts';
import type { RecapCase } from './recap-case.ts';
import type { Strings } from './strings.ts';

/**
 * Returns the suitcases of a recap, rarest Role first as the engine ranked them: a Role missed once shows that
 * Event's own label; a Role missed several times shows its count and the Role in plain words, since its Events may
 * be of different kinds. The last suitcase, when some Roles were left out, counts the rest.
 * @example
 * recapCases(recap, textFor('fr'), 'fr');
 * // [{ label: 'Cap des 1 000 pull requests mergées', count: 1 }, { label: '5 validations', count: 5 }, { label: '+ 3 autres', count: 3 }]
 */
export function recapCases(recap: Recap, text: Strings, lang: Language): RecapCase[] {
  const cases = recap.groups.map((group) => groupCase(group, text, lang));
  if (recap.more > 0) cases.push(moreCase(recap.more, text, lang));

  return cases;
}

/**
 * Returns the suitcase of one Role.
 * @example
 * groupCase({ archetype: 'error', rarity: 'common', count: 2, latest }, textFor('en'), 'en'); // { label: '2 errors', ... }
 */
function groupCase(group: RecapGroup, text: Strings, lang: Language): RecapCase {
  // A failed deploy is bad news too, though its Role is not.
  const news = freshTone(group.archetype) === 'news' || group.latest.meta.step === 'failed';
  if (group.count === 1) return { label: group.latest.label, count: 1, news };

  const words = text.recap.roles[group.archetype ?? 'other'];

  return { label: countPhrase(words, group.count, lang), count: group.count, news };
}
