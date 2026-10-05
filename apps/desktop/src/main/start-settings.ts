import type { Clock, SourceEvent } from '@deskorama/core';
import { CONNECTORS } from './connectors.ts';
import type { WebhookControl } from './create-webhook-control.ts';
import type { SceneControl } from './scene/create-scene-control.ts';
import { createSettingsWindow, type SettingsWindow } from './settings-window/create-settings-window.ts';
import type { SettingsService } from './settings-window/create-settings-service.ts';
import { macSystemAccess } from './settings-window/mac-system-access.ts';
import { settingsActions } from './settings-window/settings-actions.ts';
import { createTestPlayer } from './test-events/create-test-player.ts';

/**
 * Starts answering the settings window: its Sources through `service`, the wallpaper's setup through `scene`, the
 * Local webhook through `webhook`, and the test Events, played through `sendEvent`. The open window follows every
 * change of the scene and of the Local webhook. Stopping it also cancels a test deploy still running.
 * @example
 * const settings = startSettings({ service: sources.service, scene, webhook, clock, sendEvent });
 * settings.open(); // the settings window comes forward
 */
export function startSettings(options: {
  readonly service: SettingsService;
  readonly scene: SceneControl;
  readonly webhook: WebhookControl;
  readonly clock: Clock;
  readonly sendEvent: (event: SourceEvent) => void;
}): SettingsWindow {
  const { scene, webhook, clock } = options;

  const tests = createTestPlayer(clock, options.sendEvent, () => scene.restoreBuild());

  const window = createSettingsWindow(
    settingsActions({
      service: options.service,
      scene,
      webhook,
      connectors: CONNECTORS,
      playTest: (choice) => tests.play(choice),
      system: macSystemAccess(clock),
    }),
  );

  const stopFollowing = [scene.onChange(() => window.refresh()), webhook.onChange(() => window.refresh())];

  return {
    open: () => window.open(),
    refresh: () => window.refresh(),
    stop() {
      for (const stop of stopFollowing) stop();

      tests.stop();
      window.stop();
    },
  };
}
