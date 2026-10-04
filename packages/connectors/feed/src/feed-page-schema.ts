import { IDENTIFIED_EVENT_SCHEMA } from '@deskorama/event-json';
import * as v from 'valibot';
import type { FeedPage } from './feed-page.ts';

/** The most Events a page may carry: a backend pages through more with `has_more`. */
const MAX_PAGE_EVENTS = 100;

/** A Gauge value: a count, never negative. */
const COUNT = v.pipe(v.number(), v.finite(), v.minValue(0));

/**
 * One page of a Feed, as the backend returns it. Unknown top-level fields are ignored, so a backend may add its
 * own; inside an Event they are refused, as on the Local webhook. Every Event needs an id. Typed against
 * {@link FeedPage} and read through Standard Schema. `docs/feed/feed-page.schema.json` publishes the same rules.
 * @example
 * { "events": [{ "id": "evt_1042", "kind": "signup.created", "archetype": "arrival", "source": "Tramlo",
 *   "text": { "en": { "label": "New sign-up" } } }], "next_cursor": "c_1042", "has_more": false }
 */
export const FEED_PAGE_SCHEMA: v.GenericSchema<unknown, FeedPage> = v.object({
  events: v.pipe(v.array(IDENTIFIED_EVENT_SCHEMA), v.maxLength(MAX_PAGE_EVENTS)),
  next_cursor: v.nullable(
    v.pipe(
      v.string(),
      v.nonEmpty(),
      // Counted in code points, as JSON Schema's maxLength counts them.
      v.check((cursor) => Array.from(cursor).length <= 1000, 'at most 1000 characters'),
    ),
  ),
  has_more: v.boolean(),
  poll_interval: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  gauges: v.optional(
    v.object({
      crowd: v.optional(COUNT),
      daily: v.optional(COUNT),
      total: v.optional(COUNT),
      build: v.optional(v.picklist(['idle', 'building', 'ready', 'error'])),
    }),
  ),
});
