import { readSettingsObject } from './read-settings-object.ts';
import { withSettings } from './with-settings.ts';

/**
 * Returns the text of `settings.json` with the Local webhook turned on or off, its port and every other setting
 * kept as they were.
 * @example
 * withWebhookOn('{"localWebhook":{"port":5000}}', false);
 * // '{\n  "localWebhook": {\n    "port": 5000,\n    "enabled": false\n  }\n}\n'
 */
export function withWebhookOn(settingsFile: string | null, on: boolean): string {
  const current = readSettingsObject(settingsFile)?.['localWebhook'];
  const kept = typeof current === 'object' && current !== null && !Array.isArray(current) ? current : {};

  return withSettings(settingsFile, { localWebhook: { ...kept, enabled: on } });
}
