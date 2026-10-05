import { app, clipboard, shell } from 'electron';
import type { PreferencesChange } from '../shared/preferences.ts';
import { createTray, type AppTray, type TrayView } from './create-tray.ts';
import type { SceneControl } from './scene/create-scene-control.ts';
import type { WebhookControl } from './create-webhook-control.ts';
import { testCommand } from './test-command.ts';
import type { TrayState } from './tray-menu.ts';
import { writeLog } from './write-log.ts';

/** What the menu bar shows and opens. */
export interface MenuBarOptions {
  readonly scene: SceneControl;
  readonly webhook: WebhookControl;
  /** The Sources failing when the menu bar appears. */
  readonly failing: TrayState['failing'];
  readonly openSettings: () => void;
}

/**
 * Puts the app's icon in the menu bar: pause, the Theme, the Local webhook and its test command, the settings and
 * quit, in the display language. It follows the scene and the Local webhook until it is destroyed: a new language,
 * Theme or pause, or the webhook turned off, redraws the menu; an Event the webhook accepts does not. The test
 * command carries the secret of the moment it is copied.
 * @example
 * const tray = startMenuBar({ scene, webhook, failing, openSettings: () => settings.open() });
 * tray.update({ failing }); // the menu now names the failing Sources first
 */
export function startMenuBar(options: MenuBarOptions): AppTray {
  const { scene, webhook } = options;
  const { port } = webhook.state();

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

  /** The part of the menu the Local webhook decides. */
  const webhookView = (): Pick<TrayView, 'webhookOn' | 'listening'> => {
    const { on, listening } = webhook.state();

    return { webhookOn: on, listening };
  };

  const tray = createTray(
    { ...sceneView(), ...webhookView(), port, newRelease: null, failing: options.failing },
    {
      copyTestCommand: () => {
        // Electron 44's clipboard is promise-based, like the W3C Clipboard API.
        clipboard
          .writeText(testCommand(port, webhook.secret(), scene.lang()))
          .catch((error: unknown) => writeLog('tray', String(error)));
      },
      togglePause: () => scene.setPaused(!scene.paused()),
      chooseTheme: (theme) => choose({ theme }),
      openSettings: options.openSettings,
      openNewRelease: (release) => void shell.openExternal(release.url),
      quit: () => app.quit(),
    },
  );

  let shown = webhookView();

  const following = [
    scene.onChange(() => tray.update(sceneView())),
    webhook.onChange(() => {
      const next = webhookView();

      // An Event the Local webhook accepted also lands here, and changes nothing the menu shows.
      if (next.webhookOn === shown.webhookOn && next.listening === shown.listening) return;

      shown = next;
      tray.update(next);
    }),
  ];

  return {
    update: (change) => tray.update(change),
    destroy() {
      // The scene and the Local webhook outlive the icon: neither may redraw a menu that is gone.
      for (const stop of following) stop();

      tray.destroy();
    },
  };
}
