import type { Language } from '@deskorama/core';
import type { Strings } from './strings.ts';
import { EN } from './text-en.ts';
import { FR } from './text-fr.ts';

/** The words of L'Immeuble in every display language. */
export const TEXT: Readonly<Record<Language, Strings>> = { fr: FR, en: EN };

/**
 * Returns the words of L'Immeuble in one display language.
 * @example
 * textFor('en').hall; // ["KEPT", "OUT"]
 */
export function textFor(lang: Language): Strings {
  return TEXT[lang];
}
