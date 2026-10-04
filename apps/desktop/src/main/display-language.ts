import type { Language } from '@deskorama/core';

/**
 * Returns the display language for the person's preferred system languages, most preferred first: French when
 * the first one that the app speaks is French, English otherwise. The settings window can pick one instead.
 * @example
 * displayLanguage(['fr-FR', 'en-GB']); // "fr"
 * displayLanguage(['de-DE', 'fr-FR']); // "fr"
 * displayLanguage(['de-DE']); // "en"
 */
export function displayLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (base === 'fr' || base === 'en') return base;
  }
  return 'en';
}
