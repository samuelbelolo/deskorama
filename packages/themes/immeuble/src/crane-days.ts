import type { SiteState } from './site-state.ts';

/** The site sign's count when no failure is known: the building's own boast. */
const BOAST_DAYS = 30;

/** One day in milliseconds. */
const DAY_MS = 86_400_000;

/**
 * Returns how many days the site sign counts without a failed deploy at a Clock time: the whole days since the last
 * failure this screen knows of, or the building's boast of 30 when it knows none (a remount after a success forgets
 * an older failure: the host only keeps the last deploy).
 * @example
 * craneDays({ ...state, failedAt: null }, now); // 30
 * craneDays({ ...state, failedAt: now - 86_400_000 }, now); // 1
 */
export function craneDays(state: SiteState, now: number): number {
  if (state.failedAt === null) return BOAST_DAYS;

  return Math.max(0, Math.floor((now - state.failedAt) / DAY_MS));
}
