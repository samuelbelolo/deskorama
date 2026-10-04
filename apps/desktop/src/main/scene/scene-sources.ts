import type { Connector, GaugeRole } from '@deskorama/core';
import type { Preferences } from '../../shared/preferences.ts';
import type { SourceEntry } from '../sources/source-entry.ts';

/** A connected Source with the Connector that reads it. */
interface SceneSource {
  readonly entry: SourceEntry;
  readonly connector: Connector;
}

/** The Source that names the scene and the one that feeds each Gauge; all null without any Source. */
export type SceneSources = Readonly<Record<'brand' | GaugeRole, SceneSource | null>>;

/**
 * Returns the Sources the scene uses now: the brand Source the person chose, else the first connected one, and for
 * each Gauge the Source chosen for it, else the brand Source. A choice that names a removed Source, or one whose
 * Connector the app does not know, falls back the same way.
 * @example
 * sceneSources({ ...DEFAULT_PREFERENCES, gauges: { daily: 'src-2' } }, [tramlo, stripe], connectors);
 * // { brand: tramlo, crowd: tramlo, daily: stripe, total: tramlo } (each with its Connector)
 */
export function sceneSources(
  preferences: Preferences,
  entries: readonly SourceEntry[],
  connectors: readonly Connector[],
): SceneSources {
  const known = entries.flatMap((entry) => {
    const connector = connectors.find((candidate) => candidate.id === entry.connector);

    return connector === undefined ? [] : [{ entry, connector }];
  });

  const find = (id: string | null | undefined): SceneSource | undefined =>
    known.find((source) => source.entry.id === id);

  const brand = find(preferences.brand) ?? known[0] ?? null;

  return {
    brand,
    crowd: find(preferences.gauges.crowd) ?? brand,
    daily: find(preferences.gauges.daily) ?? brand,
    total: find(preferences.gauges.total) ?? brand,
  };
}
