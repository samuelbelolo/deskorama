import type { DeployStep, SourceEvent } from '@deskorama/core';
import { DEPLOY_WORDS } from './deploy-words.ts';
import type { Stamp } from './stamp.ts';

/**
 * Returns one step of a deploy of a fictional Source: the apps shipping together as the detail, and the step itself
 * so the Theme tells them apart without the kind.
 * @example
 * deployEvent('Tramlo', 'failed', ['web', 'docs', 'admin'], { id: 'github-9', at: new Date() }).text.en;
 * // { label: 'Deploy failed', detail: 'web, docs, admin: the deploy failed', tag: 'FAILED' }
 */
export function deployEvent(source: string, step: DeployStep, apps: readonly string[], { id, at }: Stamp): SourceEvent {
  const { label, tag, rarity, detail } = DEPLOY_WORDS[step];
  const words = detail(apps.join(', '));

  return {
    id,
    kind: `deploy.${step}`,
    archetype: 'deploy',
    recognised: true,
    rarity,
    source,
    at,
    step,
    text: {
      fr: { label: label.fr, detail: words.fr, tag: tag.fr },
      en: { label: label.en, detail: words.en, tag: tag.en },
    },
  };
}
