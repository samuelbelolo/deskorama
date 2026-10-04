import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a Vercel project's Gauges: deploys running now, which each poll reports, and deploys shipped today,
 * which each production success raises. Vercel gives no count of every deploy a project ever shipped: another Source
 * feeds the total. A short label is a noun: the Theme adds when it counts.
 */
export const VERCEL_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 4,
    text: {
      fr: { label: 'Déploiements en cours', short: 'EN COURS' },
      en: { label: 'Deploys in progress', short: 'RUNNING' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Mises en ligne aujourd’hui', short: 'DÉPLOIEMENTS' },
      en: { label: 'Deploys shipped today', short: 'DEPLOYS' },
    },
  },
  total: {
    text: {
      fr: { label: 'Mises en ligne au total', short: 'DÉPLOIEMENTS' },
      en: { label: 'Deploys shipped in total', short: 'DEPLOYS' },
    },
  },
};
