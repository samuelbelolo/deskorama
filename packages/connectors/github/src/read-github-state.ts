import * as v from 'valibot';
import { START, type GithubState } from './github-state.ts';

/** A count read back from a cursor. */
const COUNT = v.nullable(v.number());

/** A persisted cursor of a GitHub Connector. */
const SAVED = v.object({
  since: v.nullable(v.number()),
  etags: v.record(v.string(), v.string()),
  branch: v.string(),
  head: v.nullable(v.string()),
  stars: COUNT,
  forks: COUNT,
  openItems: COUNT,
  openPulls: COUNT,
  runs: v.array(v.number()),
  deployments: v.array(v.object({ id: v.number(), environment: v.string(), ref: v.string() })),
  actors: v.record(v.string(), v.number()),
});

/**
 * Returns the state a persisted cursor holds; a missing or unreadable one starts over, which looks back one day
 * and replays at worst Events the platform drops by id.
 * @example
 * readGithubState(null); // START
 * readGithubState(JSON.stringify(state)); // state
 */
export function readGithubState(saved: string | null): GithubState {
  if (saved === null) return START;

  try {
    const parsed = v.safeParse(SAVED, JSON.parse(saved));

    return parsed.success ? parsed.output : START;
  } catch {
    return START;
  }
}
