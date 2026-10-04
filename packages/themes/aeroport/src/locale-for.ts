import type { Language } from '@deskorama/core';

/** The locale each display language writes numbers and times in. */
const LOCALES: Readonly<Record<Language, string>> = { fr: 'fr-FR', en: 'en-GB' };

/**
 * Returns the locale numbers and times are written in for a display language.
 * @example
 * localeFor('fr'); // "fr-FR"
 */
export function localeFor(lang: Language): string {
  return LOCALES[lang];
}
