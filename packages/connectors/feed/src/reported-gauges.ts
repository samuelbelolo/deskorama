import type { GaugeValues } from '@deskorama/core';
import type { FeedPage } from './feed-page.ts';

/**
 * Returns the Gauge values a page reports, leaving out those it does not, so they keep their value.
 * @example
 * reportedGauges({ crowd: 12, build: 'ready' }); // { crowd: 12, build: 'ready' }
 */
export function reportedGauges(gauges: NonNullable<FeedPage['gauges']>): Partial<GaugeValues> {
  const { crowd, daily, total, build } = gauges;

  return {
    ...(crowd === undefined ? {} : { crowd }),
    ...(daily === undefined ? {} : { daily }),
    ...(total === undefined ? {} : { total }),
    ...(build === undefined ? {} : { build }),
  };
}
