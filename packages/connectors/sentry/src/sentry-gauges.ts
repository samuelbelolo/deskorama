import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a Sentry organization's Gauges: errors in the last hour, new errors today, errors left unresolved. Each
 * new error raises today's count; the hour's errors and the unresolved ones would cost a count Sentry gives apart
 * from the issues a poll reads, so another Source feeds them. A short label is a noun: the Theme adds when it counts.
 */
export const SENTRY_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 20,
    text: {
      fr: { label: 'Erreurs sur la dernière heure', short: 'ERREURS' },
      en: { label: 'Errors in the last hour', short: 'ERRORS' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Nouvelles erreurs aujourd’hui', short: 'NOUVELLES' },
      en: { label: 'New errors today', short: 'NEW' },
    },
  },
  total: {
    text: {
      fr: { label: 'Erreurs non résolues', short: 'NON RÉSOLUES' },
      en: { label: 'Unresolved errors', short: 'UNRESOLVED' },
    },
  },
};
