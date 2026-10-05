import type { Clock } from '@deskorama/core';
import type { SystemAccess } from '../src/main/settings-window/system-access.ts';

/**
 * Returns a Mac that stands in for the real one: its time is the Clock's, its accent colour is orange, it prefers
 * English then French, it grants opening at login at once, and it records each address it is asked to open into
 * `opened` and each text it is asked to copy into `copied`.
 * @example
 * const opened: string[] = [];
 * const system = fakeSystemAccess(clock, opened, []);
 * system.openExternal('https://tramlo.example');
 * opened; // ['https://tramlo.example']
 */
export function fakeSystemAccess(clock: Clock, opened: string[], copied: string[]): SystemAccess {
  return {
    now: () => clock.now(),
    accent: () => 'FF9500FF',
    languages: () => ['en-GB', 'fr-FR'],
    loginItem: () => ({ on: false, needsApproval: false }),
    setOpenAtLogin: (on) => ({ on, needsApproval: false }),
    openExternal: (url) => void opened.push(url),
    copy: (text) => void copied.push(text),
  };
}
