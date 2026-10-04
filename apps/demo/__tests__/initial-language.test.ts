import { expect, test } from 'vitest';
import { initialLanguage } from '../src/initial-language.ts';

test('the demo opens in the language the URL asks for, else the browser language, else English', () => {
  expect(initialLanguage('?lang=en', 'fr-FR')).toBe('en');
  expect(initialLanguage('?lang=fr', 'en-GB')).toBe('fr');
  expect(initialLanguage('?lang=de', 'fr-CA')).toBe('fr');
  expect(initialLanguage('', 'de-DE')).toBe('en');
});
