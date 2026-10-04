import type { EventText, Language } from '@deskorama/core';

/** Words that are the same in every language, such as a pull request title, or one string per language. */
export type Words = string | Readonly<Record<Language, string>>;

/**
 * Returns an Event's label, detail and tag in every display language.
 * @example
 * eventText({ fr: 'Issue ouverte', en: 'Issue opened' }, '#421 Fix sign-in', '#421');
 * // { fr: { label: 'Issue ouverte', detail: '#421 Fix sign-in', tag: '#421' }, en: { … } }
 */
export function eventText(label: Words, detail: Words, tag: Words): Readonly<Record<Language, EventText>> {
  const inLanguage = (lang: Language): EventText => ({
    label: typeof label === 'string' ? label : label[lang],
    detail: typeof detail === 'string' ? detail : detail[lang],
    tag: typeof tag === 'string' ? tag : tag[lang],
  });

  return { fr: inLanguage('fr'), en: inLanguage('en') };
}
