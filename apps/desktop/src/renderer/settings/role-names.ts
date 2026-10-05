import type { Language, ThemeMoment } from '@deskorama/core';

/** The name of each Role, and of the failed deploy, in every display language. */
export const ROLE_NAMES: Readonly<Record<ThemeMoment, Readonly<Record<Language, string>>>> = {
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
