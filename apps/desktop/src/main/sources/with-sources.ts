import * as v from 'valibot';
import type { SourceEntry } from './source-entry.ts';

/** Any JSON object: the settings this function keeps as they are. */
const SETTINGS = v.record(v.string(), v.unknown());

/**
 * Returns the text of `settings.json` with its Sources replaced and every other setting kept as it was. An
 * unreadable file is replaced.
 * @example
 * withSources('{"localWebhook":{"port":5000}}', [tramlo]);
 * // '{\n  "localWebhook": { "port": 5000 },\n  "sources": [ … ]\n}'
 */
export function withSources(settingsFile: string | null, sources: readonly SourceEntry[]): string {
  let settings: Record<string, unknown> = {};

  try {
    const parsed = v.safeParse(SETTINGS, JSON.parse(settingsFile ?? '{}'));

    if (parsed.success) settings = parsed.output;
  } catch {
    // An unreadable file is replaced by one that holds the Sources.
  }

  return `${JSON.stringify({ ...settings, sources }, null, 2)}\n`;
}
