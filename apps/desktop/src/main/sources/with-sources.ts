import { withSettings } from '../with-settings.ts';
import type { SourceEntry } from './source-entry.ts';

/**
 * Returns the text of `settings.json` with its Sources replaced and every other setting kept as it was. An
 * unreadable file is replaced.
 * @example
 * withSources('{"localWebhook":{"port":5000}}', [tramlo]);
 * // '{\n  "localWebhook": { "port": 5000 },\n  "sources": [ … ]\n}'
 */
export function withSources(settingsFile: string | null, sources: readonly SourceEntry[]): string {
  return withSettings(settingsFile, { sources });
}
