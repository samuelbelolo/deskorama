import type { Language } from '@deskorama/core';
import { countPhrase } from './count-phrase.ts';
import type { RecapCase } from './recap-case.ts';
import type { Strings } from './strings.ts';

/**
 * Returns the last suitcase, for `count` missed Events the belt does not list.
 * @example
 * moreCase(3, textFor('en'), 'en'); // { label: '+ 3 more', count: 3, news: false }
 */
export function moreCase(count: number, text: Strings, lang: Language): RecapCase {
  return { label: countPhrase(text.recap.more, count, lang), count, news: false };
}
