import type { Language } from '@deskorama/core';
import { DEMO_TEXT, type DemoText } from './demo-text.ts';
import { EXPLAINER_TEXT, type ExplainerText } from './explainer-text.ts';

/** Every word of the page in one language: the controls, the fake desktop and the explanation. */
type PageText = DemoText & ExplainerText;

/**
 * Writes the page's words in one language into every element marked `data-text`, and sets the page language.
 * @example
 * applyText(document, 'en'); // <h2 data-text="explainerTitle"> now reads "How it fits together"
 */
export function applyText(page: Document, lang: Language): void {
  const text: PageText = { ...DEMO_TEXT[lang], ...EXPLAINER_TEXT[lang] };
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
 * isTextKey('cover', text); // true
 */
function isTextKey(key: string | undefined, text: PageText): key is keyof PageText {
  return key !== undefined && Object.hasOwn(text, key);
}
