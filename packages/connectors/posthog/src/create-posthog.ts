import type { Connector } from '@deskorama/core';
import { pollPostHog } from './poll-posthog.ts';
import { POSTHOG_ABOUT } from './posthog-about.ts';
import { POSTHOG_CONFIG } from './posthog-config.ts';
import { POSTHOG_GAUGES } from './posthog-gauges.ts';

/**
 * Returns the PostHog Connector: with a read-only personal API key, one small counting query feeds the Gauges with
 * the people active right now and today's sign-ups. It never streams events, as PostHog's terms require.
 * @example
 * const posthog = createPostHog();
 * await posthog.poll({ settings: { name: 'Kavelo', values: { host, project, signupEvent }, token }, cursor: null,
 *   fetch: net.fetch, now: clock.now() });
 * // { events: [], gauges: { crowd: 14, daily: 37 }, cursor: null }
 */
export function createPostHog(): Connector {
  return {
    id: 'posthog',
    title: { fr: 'PostHog', en: 'PostHog' },
    about: POSTHOG_ABOUT,
    config: POSTHOG_CONFIG,
    gauges: POSTHOG_GAUGES,
    poll: pollPostHog,
  };
}
