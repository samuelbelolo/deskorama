import type { Language } from '@deskorama/core';

/** How each display language writes a number. */
const FORMATS: Readonly<Record<Language, Intl.NumberFormat>> = {
  fr: new Intl.NumberFormat('fr-FR'),
  en: new Intl.NumberFormat('en-US'),
};

/**
 * Returns a count written the way `lang` writes numbers.
 * @example
 * formatCount(2418, 'en'); // '2,418'
 * formatCount(2418, 'fr'); // '2 418' (with a narrow no-break space)
 */
export function formatCount(count: number, lang: Language): string {
  return FORMATS[lang].format(count);
}
