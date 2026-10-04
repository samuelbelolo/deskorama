import type { Clock, SourceEvent } from '@deskorama/core';
import type { SceneControl } from './scene/create-scene-control.ts';
import { createSettingsWindow, type SettingsWindow } from './settings-window/create-settings-window.ts';
import type { SettingsService } from './settings-window/create-settings-service.ts';
import { settingsActions } from './settings-window/settings-actions.ts';
import { createTestPlayer } from './test-events/create-test-player.ts';

/**
 * Starts answering the settings window: its Sources through `service`, the wallpaper's setup through `scene`, and
 * the test Events, played through `sendEvent`. The open window follows every change of the scene. Stopping it also
 * cancels a test deploy still running.
 * @example
 * const settings = startSettings({ service: sources.service, scene, clock, sendEvent });
 * settings.open(); // the settings window comes forward
 */
export function startSettings(options: {
  readonly service: SettingsService;
  readonly scene: SceneControl;
  readonly clock: Clock;
  readonly sendEvent: (event: SourceEvent) => void;
}): SettingsWindow {
  const { scene } = options;

  const tests = createTestPlayer(options.clock, options.sendEvent, () => scene.restoreBuild());

  const window = createSettingsWindow(settingsActions(options.service, scene, (choice) => tests.play(choice)));

  const stopFollowing = scene.onChange(() => window.refresh());

  return {
    open: () => window.open(),
    refresh: () => window.refresh(),
    stop() {
      stopFollowing();
      tests.stop();
      window.stop();
    },
  };
}
