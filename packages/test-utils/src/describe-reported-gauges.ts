import { GAUGE_ROLES, type PollResult } from '@deskorama/core';
import { expect, test } from 'vitest';

/**
 * Registers the test of a Connector that reports Gauges only, for a service whose terms forbid streaming its
 * events: a recorded first poll returns at least one Gauge count, finite and never negative, and never an Event.
 * @example
 * describeReportedGauges(() => connector.poll({ settings, cursor: null, fetch: createFakeFetch(respond).fetch, now }));
 */
export function describeReportedGauges(firstPoll: () => Promise<PollResult>): void {
  test('reports Gauge counts, finite and never negative, and never an Event', async () => {
    const result = await firstPoll();

    const counts = GAUGE_ROLES.flatMap((role) => {
      const count = result.gauges?.[role];

      return count === undefined ? [] : [count];
    });

    expect(result.events).toEqual([]);
    expect(counts.length).toBeGreaterThan(0);

    for (const count of counts) {
      expect(Number.isFinite(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
}
