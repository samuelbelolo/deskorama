// The main process: one wallpaper window per display, the menu-bar icon, the Local webhook, the connected Sources,
// the frames of other windows and the release watch.
import type { SourceEvent } from '@deskorama/core';
import { app, net, powerMonitor, screen, session, type BrowserWindow } from 'electron';
import { randomInt } from 'node:crypto';
import { toWireEvent } from '../shared/to-wire-event.ts';
import { EVENT_CHANNEL } from '../shared/wallpaper-bridge.ts';
import { createNodeClock } from './create-node-clock.ts';
import type { AppTray } from './create-tray.ts';
import { openWallpaperWindow } from './open-wallpaper-window.ts';
import { startScene } from './scene/start-scene.ts';
import { sendToWindows } from './send-to-windows.ts';
import type { SettingsWindow } from './settings-window/create-settings-window.ts';
import { createKeychain } from './sources/create-keychain.ts';
import { startFrameWatch } from './start-frame-watch.ts';
import { startLocalWebhook } from './start-local-webhook.ts';
import { startMenuBar } from './start-menu-bar.ts';
import { startSettings } from './start-settings.ts';
import { startSources } from './start-sources.ts';
import type { TrayState } from './tray-menu.ts';
import { watchReleases } from './watch-releases.ts';
import { writeLog } from './write-log.ts';

/** `owner/repo` of the GitHub repository the app is released from, set by the release build. */
declare const BUILD_REPOSITORY: string;

// A run with its own data (the end-to-end test) reads no saved Source and is not the Mac's running copy: the
// single-instance lock lives in the user data folder, so this is set before it.
const ownUserData = process.env['DESKORAMA_USER_DATA'];

if (ownUserData !== undefined && ownUserData !== '') app.setPath('userData', ownUserData);

if (app.requestSingleInstanceLock()) {
  // A menu-bar app keeps running without windows, e.g. while the last display is being swapped.
  app.on('window-all-closed', () => {});
  app.whenReady().then(start, (error: unknown) => writeLog('app', String(error)));
} else {
  // A second launch would fight the first over the Local webhook's port.
  app.quit();
}

/**
 * Starts the app once Electron is ready: opens the wallpapers on the scene the settings describe, listens for local
 * Events, polls the connected Sources, reads the other windows' frames, shows the menu-bar icon, starts watching for
 * new releases, and removes the Dock icon. Polling catches up and frames are read again when the Mac wakes.
 * @example
 * app.whenReady().then(start);
 */
async function start(): Promise<void> {
  // The Theme needs no camera, microphone, notification or any other permission.
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, answer) => answer(false));

  const clock = createNodeClock();
  const userData = app.getPath('userData');

  const windows: BrowserWindow[] = [];
  const send = (channel: string, payload: unknown): void => sendToWindows(windows, channel, payload);
  const sendEvent = (event: SourceEvent): void => send(EVENT_CHANNEL, toWireEvent(event));

  // Read before the windows open, so each page draws the chosen Theme, language and brand from its first frame.
  const scene = startScene(userData, send);

  const opened = screen
    .getAllDisplays()
    .map((display) => openWallpaperWindow(display, scene.scene(), randomInt(2 ** 31)));

  windows.push(...opened.map(({ window }) => window));

  const webhook = await startLocalWebhook(
    (event) => sendEvent(scene.fromSource(null, event)),
    clock,
    userData,
    createKeychain(''),
  );

  // The pages must listen before the first poll, or its Events are lost while its cursor moves on.
  await Promise.all(opened.map(({ loaded }) => loaded));

  // The Sources start before the menu and the settings window do, so their first states only reach them once they
  // exist.
  let failing: TrayState['failing'] = [];
  let tray: AppTray | undefined;
  let settings: SettingsWindow | undefined;

  const sources = startSources({
    clock,
    userData,
    lang: scene.lang,
    onEvent: (event, sourceId) => sendEvent(scene.fromSource(sourceId, event)),
    onGauges: (sourceId, values) => scene.setGauges(sourceId, values),
    onStates: (states) => {
      failing = states.flatMap(({ entry, status }) =>
        status.state === 'failing' ? [{ name: entry.name, failure: status.failure }] : [],
      );

      scene.setSources(states.map(({ entry }) => entry));
      tray?.update({ failing });
      settings?.refresh();
    },
  });

  settings = startSettings({ service: sources.service, scene, clock, sendEvent });

  const frames = startFrameWatch(windows, clock);

  tray = startMenuBar({ scene, webhook, failing, openSettings: () => settings?.open() });

  const stopWatching = watchReleases({
    repository: BUILD_REPOSITORY,
    version: app.getVersion(),
    clock,
    fetch: (url, init) => net.fetch(url, init),
    onNewRelease: (newRelease) => tray?.update({ newRelease }),
  });

  powerMonitor.on('suspend', () => frames.pause());
  powerMonitor.on('resume', () => {
    frames.resume();
    sources.pollAll();
  });

  // No Dock icon. The packaged app starts as a regular Dock app despite LSUIElement, and a policy set at the top of
  // start() did not hold (Electron 44 on macOS 27, caught by the end-to-end test); set last, it does.
  app.setActivationPolicy('accessory');

  app.on('before-quit', () => {
    stopWatching();
    frames.stop();
    sources.stop();
    settings?.stop();
    tray?.destroy();
    void webhook.stop();
  });
}
