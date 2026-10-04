import type { SourceEvent } from '@deskorama/core';
import type { TrackedDeployment } from './tracked-deployment.ts';
import { VERCEL_KINDS, type VercelKind } from './vercel-kinds.ts';

/**
 * Returns the Event of one step of a deployment, worded in both languages: its detail names the project and the
 * branch, never who pushed. Its id joins the deployment's and the kind, so a step told twice is dropped.
 * @example
 * toVercelEvent('deployment.failed', tracked, 1791122280000, 'Tramlo').text.en;
 * // { label: 'Deploy failed', detail: 'tramlo-web · main', tag: 'FAILED' }
 */
export function toVercelEvent(
  kind: VercelKind,
  deployment: TrackedDeployment,
  at: number,
  source: string,
): SourceEvent {
  const words = VERCEL_KINDS[kind];

  const detail = deployment.branch === null ? deployment.name : `${deployment.name} · ${deployment.branch}`;

  return {
    id: `${deployment.id}-${kind}`,
    kind,
    archetype: words.archetype,
    recognised: true,
    rarity: words.rarity,
    source,
    at: new Date(at),
    text: {
      fr: { label: words.label.fr, detail, tag: words.tag.fr },
      en: { label: words.label.en, detail, tag: words.tag.en },
    },
    ...(words.step === undefined ? {} : { step: words.step }),
    ...(words.gauge === undefined ? {} : { gauge: words.gauge }),
  };
}
