import type { Connector } from '@deskorama/core';
import { listVercelOptions } from './list-vercel-options.ts';
import { VERCEL_ABOUT } from './vercel-about.ts';
import { pollVercel } from './poll-vercel.ts';
import { VERCEL_CONFIG } from './vercel-config.ts';
import { VERCEL_GAUGES } from './vercel-gauges.ts';

/**
 * Returns the Vercel Connector: it polls the deployments of one or several projects with a token scoped to their
 * team, plays each production deploy's steps, and tells when a preview is ready or broken. It lists the projects the
 * token can see, to pick them from.
 * @example
 * const vercel = createVercel();
 * await vercel.poll({ settings: { name: 'Tramlo', values: {}, lists: { projects: ['prj_web', 'prj_api'] }, token },
 *   cursor: null, fetch: net.fetch, now: clock.now() });
 */
export function createVercel(): Connector {
  return {
    id: 'vercel',
    title: { fr: 'Vercel', en: 'Vercel' },
    about: VERCEL_ABOUT,
    config: VERCEL_CONFIG,
    gauges: VERCEL_GAUGES,
    poll: pollVercel,
    listOptions: listVercelOptions,
  };
}
