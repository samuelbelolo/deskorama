import type { Language } from '@deskorama/core';
import type { Strings } from './strings.ts';
import { EN } from './text-en.ts';
import { FR } from './text-fr.ts';

/** The words of L'Aéroport in every display language. */
export const TEXT: Readonly<Record<Language, Strings>> = { fr: FR, en: EN };

/**
 * Returns the words of L'Aéroport in one display language.
 * @example
 * textFor('en').airport.name; // "Prod-on-Sea"
 */
export function textFor(lang: Language): Strings {
  return TEXT[lang];
}
