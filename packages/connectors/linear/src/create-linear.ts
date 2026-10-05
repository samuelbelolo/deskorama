import type { Connector } from '@deskorama/core';
import { LINEAR_ABOUT } from './linear-about.ts';
import { LINEAR_CONFIG } from './linear-config.ts';
import { LINEAR_GAUGES } from './linear-gauges.ts';
import { pollLinear } from './poll-linear.ts';

/**
 * Returns the Linear Connector: it polls the workspace of a read-only API key, and plays each issue created and
 * each issue completed.
 * @example
 * const linear = createLinear();
 * await linear.poll({ settings: { name: 'Tramlo', values: {}, token }, cursor: null, fetch: net.fetch,
 *   now: clock.now() });
 */
export function createLinear(): Connector {
  return {
    id: 'linear',
    title: { fr: 'Linear', en: 'Linear' },
    about: LINEAR_ABOUT,
    config: LINEAR_CONFIG,
    gauges: LINEAR_GAUGES,
    poll: pollLinear,
  };
}
