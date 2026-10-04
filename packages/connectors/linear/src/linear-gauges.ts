import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a Linear workspace's Gauges: issues in progress, issues completed today, issues still open. Each
 * completion raises today's count; Linear offers no count of open or started issues short of paging the whole
 * workspace, so another Source feeds the crowd and the total. A short label is a noun: the Theme adds when it counts.
 */
export const LINEAR_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 20,
    text: {
      fr: { label: 'Issues en cours', short: 'EN COURS' },
      en: { label: 'Issues in progress', short: 'IN PROGRESS' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Issues terminées aujourd’hui', short: 'TERMINÉES' },
      en: { label: 'Issues completed today', short: 'DONE' },
    },
  },
  total: {
    text: {
      fr: { label: 'Issues ouvertes', short: 'OUVERTES' },
      en: { label: 'Open issues', short: 'OPEN' },
    },
  },
};
