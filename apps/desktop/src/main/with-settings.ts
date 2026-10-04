import { readSettingsObject } from './read-settings-object.ts';

/**
 * Returns the text of `settings.json` with some of its settings replaced and every other one kept as it was. An
 * unreadable file is replaced.
 * @example
 * withSettings('{"localWebhook":{"port":5000}}', { theme: 'aeroport' });
 * // '{\n  "localWebhook": {\n    "port": 5000\n  },\n  "theme": "aeroport"\n}\n'
 */
export function withSettings(settingsFile: string | null, changes: Readonly<Record<string, unknown>>): string {
  const settings = readSettingsObject(settingsFile) ?? {};

  return `${JSON.stringify({ ...settings, ...changes }, null, 2)}\n`;
}
