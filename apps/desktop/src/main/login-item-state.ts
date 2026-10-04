import { app } from 'electron';
import type { LoginItemState } from '../shared/settings-bridge.ts';

/**
 * Returns whether macOS opens the app at login, and whether it waits for the person to allow it in System Settings ›
 * General › Login Items. macOS keeps this setting, so `settings.json` never does.
 * @example
 * loginItemState(); // { on: true, needsApproval: false }
 */
export function loginItemState(): LoginItemState {
  const settings = app.getLoginItemSettings();

  return { on: settings.openAtLogin, needsApproval: settings.status === 'requires-approval' };
}
