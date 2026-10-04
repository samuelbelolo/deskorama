import { _electron, type ElectronApplication } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagedAppPath } from './packaged-app-path.ts';

/** The running app and how to reach its Local webhook. */
export interface Desktop {
  readonly app: ElectronApplication;
  readonly port: number;
  readonly secret: string;
}

/** A port away from the app's default, so a copy of the app already running on this Mac does not answer. */
const E2E_PORT = 47_299;

/**
 * Launches the packaged app with a known Local webhook port and secret, a user data folder of its own (no saved
 * Source is polled, no cursor of the Mac's own app is touched) and the other apps' windows ignored.
 * `ELECTRON_RUN_AS_NODE`, which some terminals set, is removed: with it Electron would start as plain Node and open
 * no window.
 * @example
 * const { app, port, secret } = await launchDesktop();
 * await app.close();
 */
export async function launchDesktop(): Promise<Desktop> {
  const secret = 'e2e-local-webhook-secret';

  const { ELECTRON_RUN_AS_NODE: _runAsNode, ...inherited } = process.env;

  const env: Record<string, string> = {
    ...Object.fromEntries(Object.entries(inherited).filter((pair): pair is [string, string] => pair[1] !== undefined)),
    DESKORAMA_WEBHOOK_PORT: String(E2E_PORT),
    DESKORAMA_WEBHOOK_SECRET: secret,
    // In the system's temporary folder, which macOS empties on its own.
    DESKORAMA_USER_DATA: mkdtempSync(join(tmpdir(), 'deskorama-e2e-')),
    // The windows open on the test machine would hide the wallpaper, and the Gag would rightly wait for room.
    DESKORAMA_WINDOW_FRAMES: 'off',
  };

  const app = await _electron.launch({ executablePath: packagedAppPath(), env });

  return { app, port: E2E_PORT, secret };
}
