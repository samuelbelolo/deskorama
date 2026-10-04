import type { SourceProfile } from '@deskorama/core';

/**
 * The Local webhook as a Source: it names the scene after the Mac itself, and its Gauges count what local scripts
 * report through the `gauge` field of their Events. A short label is a noun: the Theme adds when it counts (now,
 * today, in total).
 */
export const LOCAL_WEBHOOK_PROFILE: SourceProfile = {
  name: 'localhost',
  gauges: {
    crowd: {
      max: 10,
      text: {
        fr: { label: 'Scripts en cours', short: 'SCRIPTS' },
        en: { label: 'Scripts running', short: 'SCRIPTS' },
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
  },
};
