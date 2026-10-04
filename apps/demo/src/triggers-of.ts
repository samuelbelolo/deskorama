import type { Rarity } from '@deskorama/core';
import type { DemoSource, Words } from './sources/demo-source.ts';
import { DEPLOY_WORDS } from './simulate/deploy-words.ts';
import { foreignEvents } from './simulate/foreign-events.ts';

/** One button of the control panel that sends an Event by hand. */
export interface Trigger {
  /** The kind the simulator sends. */
  readonly kind: string;
  readonly label: Words;
  /** How rare it is, or `foreign` for an Event no Source of the demo describes. */
  readonly rarity: Rarity | 'foreign';
}

/**
 * Returns every Event the visitor can send by hand for a fictional Source: each of its kinds, a deploy that ships and
 * one that fails, then an Event from another Source and one of a kind nobody described.
 * @example
 * triggersOf(TRAMLO).map((each) => each.kind).slice(-4); // ["deploy.succeeded", "deploy.failed", "mail.received", "discussion.created"]
 */
export function triggersOf(source: DemoSource): readonly Trigger[] {
  const own = source.kinds.map(({ kind, label, rarity }) => ({ kind, label, rarity }));

  const deploys = (['succeeded', 'failed'] as const).map((step) => ({
    kind: `deploy.${step}`,
    label: DEPLOY_WORDS[step].label,
    rarity: DEPLOY_WORDS[step].rarity,
  }));

  const foreign = foreignEvents(source.profile.name).map(({ kind, source: from, text }) => ({
    kind,
    label: { fr: `${from} : ${text.fr.label}`, en: `${from}: ${text.en.label}` },
    rarity: 'foreign' as const,
  }));

  return [...own, ...deploys, ...foreign];
}
