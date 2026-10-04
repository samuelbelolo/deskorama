import type { Archetype, DeployStep, GaugeMove, Language, Rarity } from '@deskorama/core';

/** The kinds of Event a Vercel project produces: the steps of a production deploy, and the end of a preview. */
export type VercelKind =
  | 'deployment.started'
  | 'deployment.succeeded'
  | 'deployment.failed'
  | 'deployment.canceled'
  | 'preview.ready'
  | 'preview.failed';

/** How one kind plays: its Role, its rarity, its deploy step, its words and how it moves a Gauge. */
export interface VercelKindWords {
  readonly archetype: Archetype;
  readonly rarity: Rarity;
  readonly step?: DeployStep;
  readonly label: Readonly<Record<Language, string>>;
  readonly tag: Readonly<Record<Language, string>>;
  readonly gauge?: GaugeMove;
}

/**
 * Every kind with its Role and words. A production deploy plays the deploy steps, and its failure is the one
 * legendary scene; a preview only says it is ready or broken, so a push to a branch never plays a deploy.
 */
export const VERCEL_KINDS: Readonly<Record<VercelKind, VercelKindWords>> = {
  'deployment.started': {
    archetype: 'deploy',
    rarity: 'notable',
    step: 'started',
    label: { fr: 'Mise en ligne lancée', en: 'Deploy started' },
    tag: { fr: 'EN COURS', en: 'RUNNING' },
  },
  'deployment.succeeded': {
    archetype: 'deploy',
    rarity: 'notable',
    step: 'succeeded',
    label: { fr: 'Mise en ligne réussie', en: 'Deploy succeeded' },
    tag: { fr: 'EN LIGNE', en: 'LIVE' },
    gauge: { role: 'daily', by: 1 },
  },
  'deployment.failed': {
    archetype: 'deploy',
    rarity: 'jackpot',
    step: 'failed',
    label: { fr: 'Mise en ligne ratée', en: 'Deploy failed' },
    tag: { fr: 'RATÉE', en: 'FAILED' },
  },
  'deployment.canceled': {
    archetype: 'abandon',
    rarity: 'common',
    label: { fr: 'Mise en ligne annulée', en: 'Deploy canceled' },
    tag: { fr: 'ANNULÉE', en: 'CANCELED' },
  },
  'preview.ready': {
    archetype: 'publish',
    rarity: 'common',
    label: { fr: 'Aperçu en ligne', en: 'Preview ready' },
    tag: { fr: 'APERÇU', en: 'PREVIEW' },
  },
  'preview.failed': {
    archetype: 'error',
    rarity: 'common',
    label: { fr: 'Aperçu en échec', en: 'Preview failed' },
    tag: { fr: 'APERÇU', en: 'PREVIEW' },
  },
};
