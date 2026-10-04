import { app, clipboard, shell } from 'electron';
import type { PreferencesChange } from '../shared/preferences.ts';
import { createTray, type AppTray, type TrayView } from './create-tray.ts';
import type { SceneControl } from './scene/create-scene-control.ts';
import type { RunningWebhook } from './start-local-webhook.ts';
import { testCommand } from './test-command.ts';
import type { TrayState } from './tray-menu.ts';
import { writeLog } from './write-log.ts';

/** What the menu bar shows and opens. */
export interface MenuBarOptions {
  readonly scene: SceneControl;
  readonly webhook: RunningWebhook;
  /** The Sources failing when the menu bar appears. */
  readonly failing: TrayState['failing'];
  readonly openSettings: () => void;
}

/**
 * Puts the app's icon in the menu bar: pause, the Theme, the Local webhook and its test command, the settings and
 * quit, in the display language. It follows the scene: a new language, Theme or pause redraws the menu.
 * @example
 * const tray = startMenuBar({ scene, webhook, failing, openSettings: () => settings.open() });
 * tray.update({ failing }); // the menu now names the failing Sources first
 */
export function startMenuBar(options: MenuBarOptions): AppTray {
  const { scene, webhook } = options;
  const { port, secret } = webhook.settings;

  /** Applies a change chosen in the menu bar; a settings file that cannot be written is logged, never fatal. */
  const choose = (change: PreferencesChange): void => {
    try {
      scene.setPreferences(change);
    } catch (error) {
      writeLog('settings', String(error));
    }
  };

  /** The part of the menu the scene decides. */
  const sceneView = (): Pick<TrayView, 'lang' | 'theme' | 'paused'> => ({
    lang: scene.lang(),
    theme: scene.scene().theme,
    paused: scene.paused(),
  });

  const tray = createTray(
    { ...sceneView(), port, listening: webhook.listening, newRelease: null, failing: options.failing },
    {
      copyTestCommand: () => {
        // Electron 44's clipboard is promise-based, like the W3C Clipboard API.
        clipboard
          .writeText(testCommand(port, secret, scene.lang()))
          .catch((error: unknown) => writeLog('tray', String(error)));
      },
      togglePause: () => scene.setPaused(!scene.paused()),
      chooseTheme: (theme) => choose({ theme }),
      openSettings: options.openSettings,
      openNewRelease: (release) => void shell.openExternal(release.url),
      quit: () => app.quit(),
    },
  );

  scene.onChange(() => tray.update(sceneView()));

  return tray;
}
