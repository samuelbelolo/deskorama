import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a Feed's Gauges: a Feed may report any count, so they name what is counted plainly. A short label
 * is a noun: the Theme adds when it counts (now, today, in total).
 */
export const FEED_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 50,
    text: {
      fr: { label: 'Personnes en ligne', short: 'EN LIGNE' },
      en: { label: 'People online', short: 'ONLINE' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Événements aujourd’hui', short: 'ÉVÉNEMENTS' },
      en: { label: 'Events today', short: 'EVENTS' },
    },
  },
  total: {
    text: {
      fr: { label: 'Événements au total', short: 'ÉVÉNEMENTS' },
      en: { label: 'Events in total', short: 'EVENTS' },
    },
  },
};
