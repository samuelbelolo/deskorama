import type { Language } from '@deskorama/core';

/** The locale each display language writes numbers, times and plurals in. */
const LOCALES: Readonly<Record<Language, string>> = { fr: 'fr-FR', en: 'en-GB' };

/**
 * Returns the locale of a display language.
 * @example
 * localeFor('fr'); // "fr-FR"
 */
export function localeFor(lang: Language): string {
  return LOCALES[lang];
}
