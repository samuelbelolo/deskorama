import * as v from 'valibot';
import type { SourceEntry } from './source-entry.ts';

/** One Source in `settings.json`; a chosen interval that is not a whole number of milliseconds is left out. */
const ENTRY = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  connector: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.nonEmpty()),
  values: v.record(v.string(), v.string()),
  interval: v.fallback(v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))), undefined),
});

/** The part of `settings.json` read here. */
const FILE = v.object({ sources: v.array(v.unknown()) });

/**
 * Returns the Sources kept in the text of `settings.json`. An unreadable file has none, and an entry that does not
 * parse is skipped, so one bad line never loses the others. A chosen interval is kept as written, the poller holding
 * it within its Connector's bounds; one that is not a whole number of milliseconds is left out, so its Source is
 * polled at the Connector's default.
 * @example
 * readSources('{"sources":[{"id":"src-1","connector":"feed","name":"Tramlo","values":{"url":"https://…"}}]}');
 * // [{ id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: 'https://…' } }]
 */
export function readSources(settingsFile: string | null): SourceEntry[] {
  if (settingsFile === null) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(settingsFile);
  } catch {
    return [];
  }

  const file = v.safeParse(FILE, parsed);

  if (!file.success) return [];

  return file.output.sources.flatMap((item) => {
    const entry = v.safeParse(ENTRY, item);

    return entry.success ? [entry.output] : [];
  });
}
