import type { Random } from '@deskorama/core';
import type { DemoKind, DemoSource } from '../sources/demo-source.ts';
import { activityAt } from './activity-at.ts';
import { samplePoisson } from './sample-poisson.ts';

/**
 * Returns the Events a fictional Source sends during `minutes` of activity at a fractional hour, as the kinds to send
 * in turn: each kind at its daily rate, weighed by how busy the hour is, drawn with the seeded generator.
 * @example
 * dueKinds(TRAMLO, random, { hour: 14, minutes: 60 }).map((kind) => kind.kind); // e.g. ["push.main", "ci.failed", ...]
 * dueKinds(TRAMLO, random, { hour: 3, minutes: 1 }); // almost always []
 */
export function dueKinds(
  source: DemoSource,
  random: Random,
  { hour, minutes }: { readonly hour: number; readonly minutes: number },
): DemoKind[] {
  const activity = activityAt(source.hourly, hour);

  return source.kinds.flatMap((kind) => {
    const count = samplePoisson(random, (kind.perDay / 1440) * activity * minutes);

    return Array.from({ length: count }, () => kind);
  });
}
