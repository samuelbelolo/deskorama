import { ConnectorError, type GaugeValues, type PollInput, type PollResult } from '@deskorama/core';
import { buildLeftOpen } from './build-left-open.ts';
import { followPending } from './follow-pending.ts';
import { listDeployments } from './list-deployments.ts';
import { nextPending } from './next-pending.ts';
import { nextVercelState } from './next-vercel-state.ts';
import { observationEvents } from './observation-events.ts';
import { observeListed } from './observe-listed.ts';
import { readVercelState } from './read-vercel-state.ts';
import { refreshPending } from './refresh-pending.ts';
import { VERCEL_CONFIG, VERCEL_PROJECT_FIELD } from './vercel-config.ts';
import type { VercelState } from './vercel-state.ts';

/**
 * Polls a Vercel project once: lists the deployments created since the last poll, and reads again by id, ten at a
 * time and in turn, those an earlier poll saw unfinished, so a deploy going from building to failed is never missed.
 * Returns their Events oldest first (a catch-up over several pages is told at its last page), the number of
 * unfinished deployments as the crowd, the cursor, and a sooner poll while a deploy builds or more pages wait.
 * @example
 * await pollVercel({ settings: { name: 'Tramlo', values: { project: 'tramlo-web' }, token }, cursor: null, fetch, now });
 * // { events: [{ kind: 'deployment.started', … }], gauges: { crowd: 1 }, cursor: '{"since":…}', delay: 30000 }
 */
export async function pollVercel(input: PollInput): Promise<PollResult> {
  const project = input.settings.values[VERCEL_PROJECT_FIELD] ?? '';

  if (project === '') throw new ConnectorError({ kind: 'invalid-response' }, 'A Vercel Source names its project.');

  const state = readVercelState(input.cursor, input.now);

  const list = await listDeployments(input, project, state);

  const turn = followPending(state.pending, new Set(list.deployments.map((deployment) => deployment.uid)));

  const refreshed = await refreshPending(input, turn.refresh);

  // Oldest first, so Events stamped at the same time keep the order the deployments were created in.
  const listed = list.deployments
    .toSorted((a, b) => a.created - b.created)
    .map((deployment) => observeListed(deployment, state.pending));

  const catchingUp = list.deployments.length > 0 && list.pagination.next !== null;

  const told = catchingUp ? refreshed : [...refreshed, ...state.backlog, ...listed];

  const events = told
    .flatMap((observation) => observationEvents(observation, input.settings.name, input.now))
    .toSorted((a, b) => a.at.getTime() - b.at.getTime());

  const pending = nextPending(turn.carry, told, input.now);

  const next = nextVercelState(state, list, catchingUp ? [...state.backlog, ...listed] : [], pending);

  const delay = nextDelay(next);

  // Production stopped being followed with no step to close it: say it is idle again.
  const build: Partial<GaugeValues> = buildLeftOpen(state.pending, pending, events) ? { build: 'idle' } : {};

  return {
    events,
    gauges: { crowd: pending.length, ...build },
    cursor: JSON.stringify(next),
    ...(delay === undefined ? {} : { delay }),
  };
}

/**
 * Returns the wait the next poll asks for: none while older pages wait, the shortest allowed while a deploy is
 * unfinished, so its end shows soon, and the person's interval otherwise.
 * @example
 * nextDelay({ since, until: 1791120000000, newest, backlog: [], pending: [] }); // 0
 * nextDelay({ since, until: null, newest, backlog: [], pending: [building] }); // 30000
 */
function nextDelay(next: VercelState): number | undefined {
  if (next.until !== null) return 0;

  return next.pending.length > 0 ? VERCEL_CONFIG.interval.min : undefined;
}
