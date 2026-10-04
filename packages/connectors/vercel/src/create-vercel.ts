import type { Connector } from '@deskorama/core';
import { pollVercel } from './poll-vercel.ts';
import { VERCEL_CONFIG } from './vercel-config.ts';
import { VERCEL_GAUGES } from './vercel-gauges.ts';

/**
 * Returns the Vercel Connector: it polls one project's deployments with a token scoped to that project, plays each
 * production deploy's steps, and tells when a preview is ready or broken.
 * @example
 * const vercel = createVercel();
 * await vercel.poll({ settings: { name: 'Tramlo', values: { project: 'tramlo-web' }, token }, cursor: null,
 *   fetch: net.fetch, now: clock.now() });
 */
export function createVercel(): Connector {
  return {
    id: 'vercel',
    title: { fr: 'Vercel', en: 'Vercel' },
    config: VERCEL_CONFIG,
    gauges: VERCEL_GAUGES,
    poll: pollVercel,
  };
}
