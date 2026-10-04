import type { DeployStep, Rarity } from '@deskorama/core';
import type { Words } from '../sources/demo-source.ts';

/** How one deploy step reads and how rare it is, the same for every fictional Source. */
interface DeployWords {
  readonly label: Words;
  readonly tag: Words;
  readonly rarity: Rarity;
  /** The detail, from the apps shipping together, e.g. "web, docs, admin". */
  readonly detail: (apps: string) => Words;
}

/** The words of each deploy step. A failed deploy is the jackpot: it has not happened in a month. */
export const DEPLOY_WORDS: Readonly<Record<DeployStep, DeployWords>> = {
  started: {
    label: { fr: 'Mise en ligne lancée', en: 'Deploy started' },
    tag: { fr: 'EN COURS', en: 'RUNNING' },
    rarity: 'notable',
    detail: (apps) => ({ fr: `Mise en ligne de ${apps}`, en: `Shipping ${apps}` }),
  },
  succeeded: {
    label: { fr: 'Mise en ligne réussie', en: 'Deploy succeeded' },
    tag: { fr: 'EN LIGNE', en: 'LIVE' },
    rarity: 'notable',
    detail: (apps) => ({ fr: apps, en: apps }),
  },
  failed: {
    label: { fr: 'Mise en ligne ratée', en: 'Deploy failed' },
    tag: { fr: 'RATÉE', en: 'FAILED' },
    rarity: 'jackpot',
    detail: (apps) => ({ fr: `${apps} : la mise en ligne a échoué`, en: `${apps}: the deploy failed` }),
  },
};
