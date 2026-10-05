import { app } from 'electron';
import type { LoginItemState } from '../shared/settings-snapshot.ts';
import { loginItemState } from './login-item-state.ts';

/**
 * Asks macOS to open the app at login, or not any more, as the app itself (Service Management's main app
 * service), and returns what macOS reports afterwards: a build that is not signed may be refused without an error,
 * so the settings window shows what macOS says rather than what was asked.
 * @example
 * setOpenAtLogin(true); // { on: true, needsApproval: false }
 */
export function setOpenAtLogin(on: boolean): LoginItemState {
  app.setLoginItemSettings({ openAtLogin: on });

  return loginItemState();
}
