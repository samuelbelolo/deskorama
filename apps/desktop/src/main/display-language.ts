import { LANGUAGES, type Language } from '@deskorama/core';

/**
 * Returns the display language for the person's preferred system languages, most preferred first: the first one
 * the app speaks, English when it speaks none of them. The settings window can pick one instead.
 * @example
 * displayLanguage(['fr-FR', 'en-GB']); // "fr"
 * displayLanguage(['de-DE', 'fr-FR']); // "fr"
 * displayLanguage(['de-DE']); // "en"
 */
export function displayLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    const spoken = LANGUAGES.find((lang) => lang === base);

    if (spoken !== undefined) return spoken;
  }

  return 'en';
}
