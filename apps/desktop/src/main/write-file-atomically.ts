import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Writes `text` to `path` through a temporary file renamed over it, so a crash mid-write never leaves half a file.
 * @example
 * writeFileAtomically('/…/Deskorama/cursors.json', '{"src-1":"c_1042"}');
 */
export function writeFileAtomically(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });

  const temporary = `${path}.${process.pid}.tmp`;

  writeFileSync(temporary, text, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, path);
}
