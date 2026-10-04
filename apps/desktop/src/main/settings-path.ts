import { join } from 'node:path';

/**
 * Returns the path of `settings.json` in the app's user data folder: settings other than secrets, which go to the
 * Keychain.
 * @example
 * settingsPath(app.getPath('userData')); // "~/Library/Application Support/Deskorama/settings.json"
 */
export function settingsPath(userData: string): string {
  return join(userData, 'settings.json');
}
