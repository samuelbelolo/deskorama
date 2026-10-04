import type { Language, SourceProfile } from '@deskorama/core';
import type { Scene } from '../../shared/scene.ts';
import type { ShippedThemeId } from '../../shared/theme-choice.ts';
import type { SceneSources } from './scene-sources.ts';

/**
 * Returns the scene every wallpaper draws: the Theme, the display language, and the brand Source's name with each
 * Gauge worded by the Source that feeds it. Without any Source, `fallback` names the scene.
 * @example
 * sceneOf('aeroport', 'fr', sceneSources(preferences, [tramlo], connectors), LOCAL_WEBHOOK_PROFILE);
 * // { theme: 'aeroport', lang: 'fr', source: { name: 'Tramlo', gauges: { crowd: …, daily: …, total: … } } }
 */
export function sceneOf(theme: ShippedThemeId, lang: Language, sources: SceneSources, fallback: SourceProfile): Scene {
  const { brand, crowd, daily, total } = sources;

  if (brand === null || crowd === null || daily === null || total === null) {
    return { theme, lang, source: fallback };
  }

  const source: SourceProfile = {
    name: brand.entry.name,
    gauges: {
      crowd: crowd.connector.gauges.crowd,
      daily: daily.connector.gauges.daily,
      total: total.connector.gauges.total,
    },
  };

  return { theme, lang, source };
}
