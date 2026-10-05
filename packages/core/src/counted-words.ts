import type { CountWords } from './connector-field.ts';

/**
 * Returns how many values a field holds, in its Connector's own words: the line for exactly one, or the line for
 * several with the number where `{count}` stands.
 * @example
 * countedWords({ one: '1 project', many: '{count} projects' }, 1); // '1 project'
 * countedWords({ one: '1 project', many: '{count} projects' }, 3); // '3 projects'
 */
export function countedWords(words: CountWords, count: number): string {
  return count === 1 ? words.one : words.many.replace('{count}', String(count));
}
