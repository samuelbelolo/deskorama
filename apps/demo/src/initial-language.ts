import type { Language } from '@deskorama/core';

/**
 * Returns the language the demo opens in: the `lang` URL parameter, else French for a French-speaking browser,
 * else English.
 * @example
 * initialLanguage('?lang=en', 'fr-FR'); // "en"
 * initialLanguage('', 'fr-CA'); // "fr"
 * initialLanguage('', 'de-DE'); // "en"
 */
export function initialLanguage(search: string, browserLanguage: string): Language {
  const asked = new URLSearchParams(search).get('lang');
  if (asked === 'fr' || asked === 'en') return asked;
  return browserLanguage.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
