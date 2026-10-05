import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import { app } from 'electron';
import { CONNECTORS } from '../connectors.ts';
import { readSettingsFile } from '../read-settings-file.ts';
import { settingsPath } from '../settings-path.ts';
import { readSources } from '../sources/read-sources.ts';
import { withSettings } from '../with-settings.ts';
import { writeFileAtomically } from '../write-file-atomically.ts';
import { createSceneControl, type SceneControl, type SceneControlOptions } from './create-scene-control.ts';
import { readPreferences } from './read-preferences.ts';

/**
 * Returns the scene control of the app, from the preferences and the Sources saved in `settings.json` and the Mac's
 * preferred languages: it saves the preferences back to that file, and hands the scene to `wallpapers`. The Local
 * webhook names the scene while no Source is connected.
 * @example
 * const scene = startScene(app.getPath('userData'), stage);
 * scene.scene().theme; // "aeroport" on a new install
 */
export function startScene(userData: string, wallpapers: SceneControlOptions['wallpapers']): SceneControl {
  const settingsFile = readSettingsFile(userData);

  return createSceneControl({
    connectors: CONNECTORS,
    fallback: LOCAL_WEBHOOK_PROFILE,
    systemLanguages: app.getPreferredSystemLanguages(),
    preferences: readPreferences(settingsFile),
    sources: readSources(settingsFile),
    savePreferences: (preferences) =>
      writeFileAtomically(settingsPath(userData), withSettings(readSettingsFile(userData), { ...preferences })),
    wallpapers,
  });
}
