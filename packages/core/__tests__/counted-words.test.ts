import { describe, expect, test } from 'vitest';
import { countedWords } from '../src/counted-words.ts';

const PROJECTS = { one: '1 project', many: '{count} projects' };

describe('how many values a field holds', () => {
  test('is said with the line for exactly one', () => {
    expect(countedWords(PROJECTS, 1)).toBe('1 project');
  });

  test('is said with the number in the line for several', () => {
    expect(countedWords(PROJECTS, 3)).toBe('3 projects');
    expect(countedWords({ one: '1 projet', many: '{count} projets' }, 12)).toBe('12 projets');
  });
});
