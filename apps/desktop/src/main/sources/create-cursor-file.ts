import { readFileSync } from 'node:fs';
import { writeFileAtomically } from '../write-file-atomically.ts';
import type { CursorStore } from './cursor-store.ts';

/**
 * Returns a cursor store kept in one JSON file: read once, rewritten whenever a cursor changes, and a cursor
 * changes in memory only once the file holds it. Cursors are not secrets; an unreadable file starts every Source
 * over, which replays at worst Events dropped by id.
 * @example
 * const cursors = createCursorFile(join(app.getPath('userData'), 'cursors.json'));
 * cursors.write('src-1', '{"cursor":"c_1042","etag":null}');
 */
export function createCursorFile(path: string): CursorStore {
  let cursors = new Map<string, string>(Object.entries(readCursors(path)));

  return {
    read: (sourceId) => cursors.get(sourceId) ?? null,
    write(sourceId, cursor) {
      if ((cursors.get(sourceId) ?? null) === cursor) return;

      const next = new Map(cursors);

      if (cursor === null) next.delete(sourceId);
      else next.set(sourceId, cursor);

      // The cursor moves only once it is on disk: a failed write leaves the poll to resume from the old one.
      writeFileAtomically(path, `${JSON.stringify(Object.fromEntries(next), null, 2)}\n`);

      cursors = next;
    },
  };
}

/**
 * Returns the cursors saved in the file, by Source id, or none when it is missing or unreadable.
 * @example
 * readCursors('/…/cursors.json'); // { 'src-1': '{"cursor":"c_1042","etag":null}' }
 */
function readCursors(path: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));

    if (typeof parsed !== 'object' || parsed === null) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((pair): pair is [string, string] => typeof pair[1] === 'string'),
    );
  } catch {
    return {};
  }
}
