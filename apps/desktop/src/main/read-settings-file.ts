import { readFileSync } from 'node:fs';
import { settingsPath } from './settings-path.ts';

/**
 * Returns the text of `settings.json` in the app's user data folder, or null when there is none yet. It holds
 * settings other than secrets; secrets go to the Keychain.
 * @example
 * readSettingsFile(app.getPath('userData')); // '{"localWebhook":{"port":47213}}'
 */
export function readSettingsFile(userData: string): string | null {
  try {
    return readFileSync(settingsPath(userData), 'utf8');
  } catch {
    return null;
  }
}
