import type { Clock } from '@deskorama/core';
import { app, clipboard, shell, systemPreferences } from 'electron';
import { loginItemState } from '../login-item-state.ts';
import { setOpenAtLogin } from '../set-open-at-login.ts';
import { writeLog } from '../write-log.ts';
import type { SystemAccess } from './system-access.ts';

/**
 * Returns the Mac as the settings window reaches it: its accent colour and languages, the login item, the browser
 * and the clipboard. A page that cannot be opened or a text that cannot be copied is logged, never thrown.
 * @example
 * macSystemAccess(clock).accent(); // "007AFFFF" for the default blue
 */
export function macSystemAccess(clock: Clock): SystemAccess {
  return {
    now: () => clock.now(),
    accent: () => systemPreferences.getAccentColor(),
    languages: () => app.getPreferredSystemLanguages(),
    loginItem: loginItemState,
    setOpenAtLogin,
    openExternal: (url) => void shell.openExternal(url).catch((error: unknown) => writeLog('settings', String(error))),
    // Electron 44's clipboard is promise-based, like the W3C Clipboard API.
    copy: (text) => void clipboard.writeText(text).catch((error: unknown) => writeLog('settings', String(error))),
  };
}
