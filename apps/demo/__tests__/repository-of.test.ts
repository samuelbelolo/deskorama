import { expect, test } from 'vitest';
import { repositoryOf } from '../src/repository-of.ts';

test('the download link follows the repository whose GitHub Pages site serves the demo', () => {
  expect(repositoryOf(new URL('https://octo.github.io/deskorama/'))).toBe('octo/deskorama');
  expect(repositoryOf(new URL('https://octo.github.io/deskorama/index.html?lang=en'))).toBe('octo/deskorama');
  expect(repositoryOf(new URL('https://octo.github.io/'))).toBe('octo/octo.github.io');
  expect(repositoryOf(new URL('https://octo.github.io/index.html'))).toBe('octo/octo.github.io');
  expect(repositoryOf(new URL('http://localhost:4173/'))).toBe('samuelbelolo/deskorama');
});
