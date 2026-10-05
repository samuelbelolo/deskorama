import { expect, test } from 'vitest';
import { accentColour } from '../src/main/settings-window/accent-colour.ts';

test('the accent colour macOS gives becomes a CSS colour, with or without its leading hash and its alpha', () => {
  expect(accentColour('007AFFFF')).toBe('#007aff');
  expect(accentColour('#FF9500FF')).toBe('#ff9500');
  expect(accentColour('8c8c8c')).toBe('#8c8c8c');
});

test('anything else keeps the window on its default', () => {
  expect(accentColour('')).toBeNull();
  expect(accentColour('blue')).toBeNull();
  expect(accentColour('007AF')).toBeNull();
  expect(accentColour('007AFF; background: url(x)')).toBeNull();
});
