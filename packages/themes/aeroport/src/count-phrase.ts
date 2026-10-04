import type { Language } from '@deskorama/core';
import { fillTemplate } from './fill-template.ts';
import { localeFor } from './locale-for.ts';
import type { Plural } from './strings.ts';

/**
 * Returns a phrase with a count, in the singular or plural form the language's rules pick for it, the count written
 * as the language writes numbers.
 * @example
 * countPhrase({ one: '{n} bagage', other: '{n} bagages' }, 14, 'fr'); // "14 bagages"
 * countPhrase({ one: '+ {n} more', other: '+ {n} more' }, 1, 'en'); // "+ 1 more"
 */
export function countPhrase(plural: Plural, count: number, lang: Language): string {
  const locale = localeFor(lang);
  const form = new Intl.PluralRules(locale).select(count) === 'one' ? plural.one : plural.other;

  return fillTemplate(form, { n: new Intl.NumberFormat(locale).format(count) });
}
