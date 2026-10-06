// The main process: one wallpaper window per display and the engine that routes between them, the menu-bar icon,
// the Local webhook, the connected Sources, the frames of other windows and the release watch.
import type { SourceEvent } from '@deskorama/core';
import { app, BrowserWindow, net, powerMonitor, session, systemPreferences } from 'electron';
import { randomInt } from 'node:crypto';
import { createNodeClock } from './create-node-clock.ts';
import { fadeWindowsOut } from './fade-windows-out.ts';
import type { AppTray } from './create-tray.ts';
import { openWallpaperWindow } from './open-wallpaper-window.ts';
import { startScene } from './scene/start-scene.ts';
import type { SettingsWindow } from './settings-window/create-settings-window.ts';
import { createKeychain } from './sources/create-keychain.ts';
import { startFrameWatch } from './start-frame-watch.ts';
import { startLocalWebhook } from './start-local-webhook.ts';
import { startMenuBar } from './start-menu-bar.ts';
import { startSettings } from './start-settings.ts';
import { startSources } from './start-sources.ts';
import type { TrayState } from './tray-menu.ts';
import { createDisplayHost } from './wallpapers/create-display-host.ts';
import { createWallpaperStage, type WallpaperStage } from './wallpapers/create-wallpaper-stage.ts';
import { electronDisplays } from './wallpapers/electron-displays.ts';
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
  app
    .whenReady()
    .then(start)
    .catch((error: unknown) => writeLog('app', String(error)));
} else {
  // A second launch would fight the first over the Local webhook's port.
  app.quit();
}

/**
 * Starts the app once Electron is ready: opens a wallpaper on every display, on the scene the settings describe,
 * and keeps them in step with the displays, listens for local Events, polls the connected Sources, reads the other
 * windows' frames, shows the menu-bar icon, starts watching for new releases, and removes the Dock icon. When the
 * Mac wakes, polling catches up, frames are read again and GitHub is asked for a release. Quitting from the menu
 * fades the windows out first.
 * @example
 * app.whenReady().then(start);
 */
async function start(): Promise<void> {
  // The Theme needs no camera, microphone, notification or any other permission.
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, answer) => answer(false));

  const clock = createNodeClock();
  const userData = app.getPath('userData');

  const displays = electronDisplays();

  const host = createDisplayHost({
    displays,
    clock,
    reducedMotion: systemPreferences.getAnimationSettings().prefersReducedMotion,
  });

  // The scene and the wallpapers need each other: the scene is read first, so each page draws the chosen Theme,
  // language and brand from its first frame, and its later changes go to the wallpapers.
  let stage: WallpaperStage | undefined;

  const scene = startScene(userData, {
    setScene: (next) => stage?.setScene(next),
    setGauges: (values) => stage?.setGauges(values),
    setPaused: (paused) => stage?.setPaused(paused),
  });

  // A page still loading keeps what it is sent, so the first poll loses no Event.
  const wallpapers = createWallpaperStage({
    host,
    scene: scene.scene(),
    open: (setup) => openWallpaperWindow(setup, host),
    seed: () => randomInt(2 ** 31),
  });

  stage = wallpapers;

  const sendEvent = (event: SourceEvent): void => wallpapers.send(event);

  const webhook = await startLocalWebhook(
    (event) => sendEvent(scene.fromSource(null, event)),
    clock,
    userData,
    createKeychain(''),
  );

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
      const shown = JSON.stringify(failing);

      failing = states.flatMap(({ entry, status }) =>
        status.state === 'failing' ? [{ name: entry.name, failure: status.failure }] : [],
      );

      scene.setSources(states.map(({ entry }) => entry));

      // Every poll that worked lands here too, and changes nothing the menu shows.
      if (JSON.stringify(failing) !== shown) tray?.update({ failing });

      settings?.refresh();
    },
  });

  settings = startSettings({ service: sources.service, scene, webhook, clock, sendEvent });

  const frames = startFrameWatch(clock, displays, (next) => host.setWindowFrames(next));

  // A display that comes, goes or moves takes its menu bar and its Dock along: what covers the wallpapers is read
  // again at once.
  const stopDisplays = displays.onChange(() => frames.refresh());

  // Its first check answers after the menu bar is up, which it then tells.
  const releases = watchReleases({
    repository: BUILD_REPOSITORY,
    version: app.getVersion(),
    clock,
    fetch: (url, init) => net.fetch(url, init),
    onNewRelease: (newRelease) => tray?.update({ newRelease }),
  });

  tray = startMenuBar({
    scene,
    webhook,
    failing,
    releases,
    openSettings: () => settings?.open(),
    // The windows fade out first, then the app quits; a quit the system asks for (a logout) is never held back.
    quit: () => fadeWindowsOut(BrowserWindow.getAllWindows(), host, () => app.quit()),
  });

  powerMonitor.on('suspend', () => frames.pause());
  powerMonitor.on('resume', () => {
    frames.resume();
    sources.pollAll();
    // A Mac that slept through the hourly check hears of a release as it wakes.
    void releases.check();
  });

  // No Dock icon. The packaged app starts as a regular Dock app despite LSUIElement, and a policy set at the top of
  // start() did not hold (Electron 44 on macOS 27, caught by the end-to-end test); set last, it does.
  app.setActivationPolicy('accessory');

  app.on('before-quit', () => {
    releases.stop();
    stopDisplays();
    frames.stop();
    wallpapers.stop();
    host.stop();
    sources.stop();
    settings?.stop();
    tray?.destroy();
    webhook.stop().catch((error: unknown) => writeLog('webhook', String(error)));
  });
}
