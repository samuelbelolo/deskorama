import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DOCS } from './read-doc.ts';

/**
 * Returns the names of the published examples in one folder, `valid` or `invalid`.
 * @example
 * exampleNames('invalid'); // ['long-tag.json', 'missing-has-more.json', …]
 */
export function exampleNames(folder: 'valid' | 'invalid'): string[] {
  return readdirSync(join(DOCS, 'examples', folder)).filter((name) => name.endsWith('.json'));
}
