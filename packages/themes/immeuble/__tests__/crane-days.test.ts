import { describe, expect, test } from 'vitest';
import { craneDays } from '../src/crane-days.ts';
import type { SiteState } from '../src/site-state.ts';
import { AFTERNOON } from './instants.ts';

/** A parked site with no delivery, failed at a Clock time or never. */
const site = (failedAt: number | null): SiteState => ({
  phase: 'idle',
  since: AFTERNOON,
  cx: 250,
  targetX: 250,
  delivery: null,
  failedAt,
});

describe('the site sign’s day count', () => {
  test('boasts 30 days while no failure is known', () => {
    expect(craneDays(site(null), AFTERNOON)).toBe(30);
  });

  test('counts the whole days since the last failure, as the Clock moves', () => {
    expect(craneDays(site(AFTERNOON), AFTERNOON + 1000)).toBe(0);
    expect(craneDays(site(AFTERNOON), AFTERNOON + 3 * 86_400_000 + 1000)).toBe(3);
  });
});
