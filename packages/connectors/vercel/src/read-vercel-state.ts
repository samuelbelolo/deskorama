import * as v from 'valibot';
import { READY_STATES } from './ready-state.ts';
import type { VercelState } from './vercel-state.ts';

/** How far back the first poll looks: the deploys of the last hour, not the project's whole history. */
const FIRST_LOOKBACK_MS = 60 * 60_000;

/** A deployment the cursor remembers. */
const TRACKED = v.object({
  id: v.string(),
  name: v.string(),
  branch: v.nullable(v.string()),
  production: v.boolean(),
  created: v.number(),
});

/** A persisted cursor of the Vercel Connector. */
const SAVED: v.GenericSchema<unknown, VercelState> = v.object({
  since: v.number(),
  until: v.nullable(v.number()),
  newest: v.number(),
  backlog: v.array(
    v.object({
      tracked: TRACKED,
      readyState: v.picklist(READY_STATES),
      ready: v.optional(v.number()),
      wasPending: v.boolean(),
    }),
  ),
  pending: v.array(TRACKED),
});

/**
 * Returns the state a persisted cursor holds. A missing or unreadable one starts over from the last hour, which at
 * worst replays Events the platform drops by id.
 * @example
 * readVercelState(null, 1791122400000);
 * // { since: 1791118800000, until: null, newest: 1791118800000, backlog: [], pending: [] }
 */
export function readVercelState(saved: string | null, now: number): VercelState {
  const since = now - FIRST_LOOKBACK_MS;

  const start: VercelState = { since, until: null, newest: since, backlog: [], pending: [] };

  if (saved === null) return start;

  try {
    const parsed = v.safeParse(SAVED, JSON.parse(saved));

    return parsed.success ? parsed.output : start;
  } catch {
    return start;
  }
}
