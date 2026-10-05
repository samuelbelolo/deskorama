import type { Connector } from '@deskorama/core';
import { FEED_ABOUT } from './feed-about.ts';
import { FEED_CONFIG } from './feed-config.ts';
import { FEED_GAUGES } from './feed-gauges.ts';
import { pollFeed } from './poll-feed.ts';

/**
 * Returns the Feed Connector: it polls an HTTPS address of the person's own backend, which answers with its
 * Events in the documented JSON format, each with its Role and its words, after an opaque cursor.
 * @example
 * const feed = createFeed();
 * await feed.poll({ settings: { name: 'Tramlo', values: { url: 'https://api.tramlo.example/events' }, token },
 *   cursor: null, fetch: net.fetch, now: clock.now() });
 */
export function createFeed(): Connector {
  return {
    id: 'feed',
    title: { fr: 'Flux', en: 'Feed' },
    about: FEED_ABOUT,
    config: FEED_CONFIG,
    gauges: FEED_GAUGES,
    poll: pollFeed,
  };
}
