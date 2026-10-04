import type { DeployStep, Language, Rarity, SourceEvent } from '@deskorama/core';
import { clip } from './clip.ts';
import { colonDetail } from './colon-detail.ts';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import { TAG_LENGTH } from './limits.ts';
import type { Scan } from './scan.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/** The fact of each step, in each language. */
const LABELS: Readonly<Record<DeployStep, Readonly<Record<Language, string>>>> = {
  started: { fr: 'Déploiement lancé', en: 'Deploy started' },
  succeeded: { fr: 'Déploiement réussi', en: 'Deploy succeeded' },
  failed: { fr: 'Déploiement en échec', en: 'Deploy failed' },
};

/** How rare each step is: every deploy starts, fewer end, and each end is news. */
const RARITIES: Readonly<Record<DeployStep, Rarity>> = { started: 'common', succeeded: 'notable', failed: 'notable' };

/**
 * Returns the Event of one step of a deployment, with its environment and what it deployed: a commit is shortened
 * to seven characters.
 * @example
 * deployEvent({ id: 61, environment: 'production', ref: 'v2.5.0' }, 'succeeded', t, scan);
 * // { kind: 'deployment.succeeded', archetype: 'deploy', step: 'succeeded', text: { en: { detail: 'production: v2.5.0' } } }
 */
export function deployEvent(deployment: TrackedDeployment, step: DeployStep, at: number, scan: Scan): SourceEvent {
  const ref = /^[0-9a-f]{40}$/.test(deployment.ref) ? deployment.ref.slice(0, 7) : deployment.ref;

  const { environment } = deployment;

  return githubEvent(scan.source, {
    id: `deploy-${deployment.id}-${step}`,
    kind: `deployment.${step}`,
    archetype: 'deploy',
    rarity: RARITIES[step],
    at,
    step,
    text: eventText(LABELS[step], colonDetail(environment, ref), clip(environment, TAG_LENGTH)),
  });
}
