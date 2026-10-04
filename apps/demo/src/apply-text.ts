import type { Language } from '@deskorama/core';
import { DEMO_TEXT, type DemoText } from './demo-text.ts';

/**
 * Writes the page's words in one language into every element marked `data-text`, and sets the page language.
 * @example
 * applyText(document, 'en'); // <button data-text="send"> now reads "Send an event"
 */
export function applyText(page: Document, lang: Language): void {
  const text = DEMO_TEXT[lang];
  page.documentElement.lang = lang;
  for (const element of page.querySelectorAll<HTMLElement>('[data-text]')) {
    const key = element.dataset['text'];
    if (isTextKey(key, text)) element.textContent = text[key];
  }
  page.querySelector('#desk')?.setAttribute('aria-label', text.sceneLabel);
}

/**
 * Returns true when `key` names one of the page's words.
 * @example
 * isTextKey('send', DEMO_TEXT.fr); // true
 */
function isTextKey(key: string | undefined, text: DemoText): key is keyof DemoText {
  return key !== undefined && Object.hasOwn(text, key);
}
