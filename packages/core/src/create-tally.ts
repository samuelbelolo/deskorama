import type { Archetype } from './archetype.ts';
import { stepOf } from './step-of.ts';
import type { Today } from './today.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** How many recent Events the engine keeps, newest first. */
export const RECENT_SIZE = 40;

/** How many recent Events a Theme gets when it does not say. */
const RECENT_DEFAULT = 12;

/** Today's counts per kind and per Role, the recent Events and the last deploy, shared by every screen. */
export interface Tally {
  /** Starts counting from zero when `day` is not the day being counted; returns true when it was a new day. */
  startDay(day: string): boolean;
  /** Keeps the Event among the recent ones, and counts it when it happened today. */
  record(event: WallpaperEvent, happenedToday: boolean): void;
  today(): Today;
  /** The latest Events, newest first, at most `count`. */
  readonly recent: (count?: number) => readonly WallpaperEvent[];
  /** Takes over the counts of the day `counted` and the recent Events another tally kept. */
  restore(counted: string, today: Today, recent: readonly WallpaperEvent[]): void;
}

/**
 * Returns an empty tally counting the given day.
 * @example
 * const tally = createTally('2026-10-04');
 * tally.record(mergedPullRequest, true);
 * tally.today().roles.approval; // 1
 */
export function createTally(day: string): Tally {
  let counting = day;
  let kinds: Record<string, number> = {};
  let roles: Partial<Record<Archetype, number>> = {};
  let lastDeploy: WallpaperEvent | null = null;
  let latest: readonly WallpaperEvent[] = [];

  return {
    startDay(next) {
      if (next === counting) return false;

      counting = next;
      kinds = {};
      roles = {};

      return true;
    },

    record(event, happenedToday) {
      latest = [event, ...latest].slice(0, RECENT_SIZE);

      const step = stepOf(event);
      if (step === 'succeeded' || step === 'failed') lastDeploy = event;

      if (!happenedToday) return;

      kinds[event.kind] = (kinds[event.kind] ?? 0) + 1;
      if (event.archetype !== null) roles[event.archetype] = (roles[event.archetype] ?? 0) + 1;
    },

    today: () => ({ kinds: { ...kinds }, roles: { ...roles }, lastDeploy }),
    recent: (count = RECENT_DEFAULT) => latest.slice(0, Math.max(0, count)),

    restore(counted, today, recent) {
      counting = counted;
      kinds = { ...today.kinds };
      roles = { ...today.roles };
      lastDeploy = today.lastDeploy;
      latest = recent.slice(0, RECENT_SIZE);
    },
  };
}
