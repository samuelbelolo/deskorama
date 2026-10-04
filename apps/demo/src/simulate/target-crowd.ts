import type { DemoSource } from '../sources/demo-source.ts';
import { activityAt } from './activity-at.ts';

/**
 * Returns the crowd a fictional Source expects at a fractional hour: its usual crowd shaped by the hour of the day,
 * times its rush when the hour falls in it.
 * @example
 * targetCrowd(TRAMLO, 14); // about 7: a busy afternoon
 * targetCrowd(BAILIX, 8.1); // three times the morning crowd, during the 8 o'clock rush
 */
export function targetCrowd(source: DemoSource, hour: number): number {
  const { crowdMedian, crowdPeak } = source.gauges;
  const rush = crowdPeak !== undefined && hour >= crowdPeak.from && hour < crowdPeak.to ? crowdPeak.factor : 1;

  return Math.min(source.profile.gauges.crowd.max, crowdMedian * activityAt(source.hourly, hour) * rush);
}
