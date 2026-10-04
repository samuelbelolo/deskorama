import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The published Feed format: the JSON Schema and its examples. */
export const DOCS: string = join(import.meta.dirname, '../../../../docs/feed');

/**
 * Returns the parsed JSON of a file of the published Feed format.
 * @example
 * readDoc('examples/valid/first-page.json'); // { events: [ … ], next_cursor: 'c_1042', has_more: true }
 */
export function readDoc(path: string): unknown {
  return JSON.parse(readFileSync(join(DOCS, path), 'utf8')) as unknown;
}
