import type { DemoSource } from '../sources/demo-source.ts';
import { activityAt } from './activity-at.ts';
import type { GaugeState } from './gauge-state.ts';
import { targetCrowd } from './target-crowd.ts';

/** The step, in hours, of the sum that counts the daily Gauge since midnight. */
const QUARTER = 0.25;

/**
 * Returns a fictional Source's Gauges as a first poll would find them at a fractional hour: the crowd of that hour,
 * the daily count reached since midnight, and the running total it starts from.
 * @example
 * seedGauges(TRAMLO, 14).daily; // about 25 of Tramlo's 46 commits a day
 * seedGauges(TRAMLO, 0).daily; // 0
 */
export function seedGauges(source: DemoSource, hour: number): GaugeState {
  let daily = 0;

  for (let at = 0; at < hour; at += QUARTER) {
    daily += source.gauges.dailyPerDay * (QUARTER / 24) * activityAt(source.hourly, at);
  }

  return { crowd: targetCrowd(source, hour), daily, total: source.gauges.totalStart };
}
