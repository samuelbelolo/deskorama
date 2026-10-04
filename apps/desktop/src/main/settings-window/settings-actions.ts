import type { TestEventChoice } from '../../shared/test-event-choice.ts';
import { loginItemState } from '../login-item-state.ts';
import type { SceneControl } from '../scene/create-scene-control.ts';
import { setOpenAtLogin } from '../set-open-at-login.ts';
import type { SettingsService } from './create-settings-service.ts';
import type { SettingsActions } from './register-settings-ipc.ts';
import { wallpaperView } from './wallpaper-view.ts';

/**
 * Returns everything the settings page may ask: the Sources through `service`, the wallpaper's setup through
 * `scene`, opening at login through macOS, and the test Events through `playTest`. What it shows is in the display
 * language.
 * @example
 * const actions = settingsActions(sources.service, scene, (choice) => tests.play(choice));
 * actions.snapshot().lang; // "fr" on a Mac in French
 */
export function settingsActions(
  service: SettingsService,
  scene: SceneControl,
  playTest: (choice: TestEventChoice) => void,
): SettingsActions {
  return {
    ...service,
    snapshot: () => ({ ...service.snapshot(), lang: scene.lang(), wallpaper: wallpaperView(scene, loginItemState()) }),
    setPreferences: (change) => scene.setPreferences(change),
    setOpenAtLogin,
    playTest,
  };
}
