import type { Language } from '@deskorama/core';
import type { TestEventChoice } from '../../shared/test-event-choice.ts';

/** The name of each test Event's button, in every display language: its Role, or the failed deploy. */
export const TEST_EVENT_NAMES: Readonly<Record<TestEventChoice, Readonly<Record<Language, string>>>> = {
  arrival: { fr: 'Arrivée', en: 'Arrival' },
  partner: { fr: 'Partenaire', en: 'Partner' },
  departure: { fr: 'Départ', en: 'Departure' },
  approval: { fr: 'Approbation', en: 'Approval' },
  rejection: { fr: 'Refus', en: 'Rejection' },
  abandon: { fr: 'Abandon', en: 'Abandon' },
  like: { fr: 'J’aime', en: 'Like' },
  celebration: { fr: 'Célébration', en: 'Celebration' },
  message: { fr: 'Message', en: 'Message' },
  publish: { fr: 'Publication', en: 'Publish' },
  usage: { fr: 'Activité', en: 'Usage' },
  money: { fr: 'Argent', en: 'Money' },
  error: { fr: 'Erreur', en: 'Error' },
  blocked: { fr: 'Intrus bloqué', en: 'Blocked intruder' },
  deploy: { fr: 'Déploiement', en: 'Deploy' },
  'failed-deploy': { fr: 'Déploiement raté', en: 'Failed deploy' },
};
