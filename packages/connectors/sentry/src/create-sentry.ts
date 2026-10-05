import type { Connector } from '@deskorama/core';
import { listSentryOptions } from './list-sentry-options.ts';
import { SENTRY_ABOUT } from './sentry-about.ts';
import { pollSentry } from './poll-sentry.ts';
import { SENTRY_CONFIG } from './sentry-config.ts';
import { SENTRY_GAUGES } from './sentry-gauges.ts';

/**
 * Returns the Sentry Connector: it polls one organization's issues with a read token, in all of its projects and
 * environments or in those picked, and plays each new error and each error that comes back. It lists the
 * organizations the token can see, and the projects and environments of one, to pick them from.
 * @example
 * const sentry = createSentry();
 * await sentry.poll({ settings: { name: 'Tramlo', values: { organization: 'tramlo' }, token }, cursor: null,
 *   fetch: net.fetch, now: clock.now() });
 * // { events: [{ kind: 'issue.new', … }], cursor: '{"since":…}' }
 */
export function createSentry(): Connector {
  return {
    id: 'sentry',
    title: { fr: 'Sentry', en: 'Sentry' },
    about: SENTRY_ABOUT,
    config: SENTRY_CONFIG,
    gauges: SENTRY_GAUGES,
    poll: pollSentry,
    listOptions: listSentryOptions,
  };
}
