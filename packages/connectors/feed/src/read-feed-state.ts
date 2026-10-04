import * as v from 'valibot';
import type { FeedState } from './feed-state.ts';

/** Where nothing was read yet. */
const START: FeedState = { cursor: null, etag: null };

/** A persisted cursor of the Feed. */
const SAVED = v.object({ cursor: v.nullable(v.string()), etag: v.nullable(v.string()) });

/**
 * Returns the state a persisted cursor holds; a missing or unreadable one starts the Feed over, which replays at
 * worst Events the platform drops by id.
 * @example
 * readFeedState('{"cursor":"c_1042","etag":"\\"p7\\""}'); // { cursor: 'c_1042', etag: '"p7"' }
 * readFeedState(null); // { cursor: null, etag: null }
 */
export function readFeedState(saved: string | null): FeedState {
  if (saved === null) return START;

  try {
    const parsed = v.safeParse(SAVED, JSON.parse(saved));

    return parsed.success ? parsed.output : START;
  } catch {
    return START;
  }
}
