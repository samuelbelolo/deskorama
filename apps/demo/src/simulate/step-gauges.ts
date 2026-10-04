import type { Random } from '@deskorama/core';
import type { DemoSource } from '../sources/demo-source.ts';
import { activityAt } from './activity-at.ts';
import type { GaugeState } from './gauge-state.ts';
import { targetCrowd } from './target-crowd.ts';

/** How many minutes of activity the crowd takes to settle on the crowd of the hour. */
const CROWD_SETTLE_MINUTES = 8;

/**
 * Returns a fictional Source's Gauges `minutes` of activity later: the crowd drifts towards the crowd of the hour
 * with a little noise, the daily count grows at the hour's rate unless the Source's Events count it, and the running
 * total wanders slowly.
 * @example
 * stepGauges(TRAMLO_KIT, { crowd: 3, daily: 200, total: 2418 }, { hour: 14, minutes: 10, random });
 * // { crowd: about 4, daily: about 203, total: about 2418 }
 */
export function stepGauges(
  source: DemoSource,
  state: GaugeState,
  { hour, minutes, random }: { readonly hour: number; readonly minutes: number; readonly random: Random },
): GaugeState {
  const max = source.profile.gauges.crowd.max;
  const ease = Math.min(1, minutes / CROWD_SETTLE_MINUTES);
  const noise = (random.next() - 0.5) * Math.min(1.5, minutes);
  const crowd = state.crowd + (targetCrowd(source, hour) - state.crowd) * ease + noise;

  const { dailyPerDay, dailyByEvents } = source.gauges;
  const daily = dailyByEvents
    ? state.daily
    : state.daily + (dailyPerDay / 1440) * activityAt(source.hourly, hour) * minutes;
  const total = state.total + (random.next() - 0.45) * minutes * source.gauges.totalDrift;

  return { crowd: Math.max(0, Math.min(max, crowd)), daily, total: Math.max(0, total) };
}
