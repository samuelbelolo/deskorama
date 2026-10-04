import { GAUGE_ROLES, type GaugeValues } from '@deskorama/core';
import type { SceneSources } from './scene-sources.ts';

/** The values of the three Gauge roles, without the build state. */
type CountValues = Partial<Pick<GaugeValues, 'crowd' | 'daily' | 'total'>>;

/**
 * Returns the Gauge values the scene shows: for each role, the latest value reported by the Source that feeds it.
 * A role whose Source has reported nothing yet is left out, so the scene keeps what Events moved it to.
 * @example
 * const latest = new Map([['src-1', { crowd: 4, daily: 12 }], ['src-2', { daily: 3 }]]);
 * composeGauges(latest, { brand: tramlo, crowd: tramlo, daily: stripe, total: tramlo });
 * // { crowd: 4, daily: 3 } (tramlo is src-1, stripe is src-2)
 */
export function composeGauges(latest: ReadonlyMap<string, Partial<GaugeValues>>, sources: SceneSources): CountValues {
  const values: { -readonly [Role in keyof CountValues]: CountValues[Role] } = {};

  for (const role of GAUGE_ROLES) {
    const id = sources[role]?.entry.id;
    const value = id === undefined ? undefined : latest.get(id)?.[role];

    if (value !== undefined) values[role] = value;
  }

  return values;
}
