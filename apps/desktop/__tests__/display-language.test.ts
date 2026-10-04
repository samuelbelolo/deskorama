import { expect, test } from 'vitest';
import { displayLanguage } from '../src/main/display-language.ts';

test('the app speaks the first preferred system language it knows, else English', () => {
  expect(displayLanguage(['fr-FR', 'en-GB'])).toBe('fr');
  expect(displayLanguage(['en-US', 'fr-FR'])).toBe('en');
  expect(displayLanguage(['de-DE', 'fr-CA'])).toBe('fr');
  expect(displayLanguage(['de-DE'])).toBe('en');
  expect(displayLanguage([])).toBe('en');
});
