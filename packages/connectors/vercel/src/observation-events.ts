import type { SourceEvent } from '@deskorama/core';
import { isUnfinished } from './is-unfinished.ts';
import type { Observation } from './observation.ts';
import { toVercelEvent } from './to-vercel-event.ts';
import type { VercelKind } from './vercel-kinds.ts';

/**
 * Returns the Event a poll's sight of a deployment tells, if any: a production deploy seen unfinished for the first
 * time has started; a finished one succeeded, failed or was canceled, at the time Vercel gives or else now.
 * @example
 * observationEvents({ tracked, readyState: 'ERROR', ready: 1791122280000, wasPending: true }, 'Tramlo', now);
 * // [{ kind: 'deployment.failed', archetype: 'deploy', step: 'failed', rarity: 'jackpot', … }]
 */
export function observationEvents(observation: Observation, source: string, now: number): SourceEvent[] {
  const kind = kindOf(observation);

  if (kind === null) return [];

  const at = isUnfinished(observation.readyState) ? observation.tracked.created : (observation.ready ?? now);

  return [toVercelEvent(kind, observation.tracked, at, source)];
}

/**
 * Returns the kind of Event a sight of a deployment tells, or null when there is nothing to tell: a preview that
 * starts, a deploy still building after its start was told, a blocked or deleted deployment.
 * @example
 * kindOf({ tracked: { …, production: false }, readyState: 'READY', wasPending: true }); // 'preview.ready'
 * kindOf({ tracked: { …, production: true }, readyState: 'BUILDING', wasPending: true }); // null
 */
function kindOf({ tracked, readyState, wasPending }: Observation): VercelKind | null {
  const { production } = tracked;

  if (isUnfinished(readyState)) return production && !wasPending ? 'deployment.started' : null;

  if (readyState === 'READY') return production ? 'deployment.succeeded' : 'preview.ready';

  if (readyState === 'ERROR') return production ? 'deployment.failed' : 'preview.failed';

  if (readyState === 'CANCELED' && production) return 'deployment.canceled';

  // A blocked or deleted deployment, or a canceled preview: nothing worth a Gag.
  return null;
}
