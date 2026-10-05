import { GAUGE_ROLES, type GaugeRole } from '@deskorama/core';
import type { LoginItemState, WallpaperView } from '../../shared/settings-snapshot.ts';
import type { SceneControl } from '../scene/create-scene-control.ts';

/**
 * Returns how the wallpaper is set up, as the settings window shows it: the Theme and language the person picked,
 * the Source that names the scene now (a removed choice shows its fallback), the Source pinned to each Gauge (null
 * when it follows the brand Source, or when the pinned Source is gone), and whether the app opens at login.
 * @example
 * wallpaperView(scene, loginItemState());
 * // { theme: 'aeroport', language: 'system', brand: 'src-1', gauges: { crowd: null, … }, login: { on: false, … } }
 */
export function wallpaperView(scene: SceneControl, login: LoginItemState): WallpaperView {
  const { theme, language, gauges: pinned } = scene.preferences();
  const sources = scene.sources();

  const gauges: Record<GaugeRole, string | null> = { crowd: null, daily: null, total: null };

  for (const role of GAUGE_ROLES) {
    const id = sources[role]?.entry.id;

    if (id !== undefined && id === pinned[role]) gauges[role] = id;
  }

  return { theme, language, brand: sources.brand?.entry.id ?? null, gauges, login };
}
