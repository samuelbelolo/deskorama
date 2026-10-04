import type { Archetype, DeployStep, EventText, Language, Rarity } from '@deskorama/core';

/** The words and the weight of a test Event: invented, so a test never shows anyone's data. */
interface TestEventWords {
  readonly rarity: Rarity;
  readonly text: Readonly<Record<Language, EventText>>;
}

/** A test Event for every Role but deploy, whose steps have their own words. */
export const TEST_EVENT_TEXT: Readonly<Record<Exclude<Archetype, 'deploy'>, TestEventWords>> = {
  arrival: {
    rarity: 'common',
    text: {
      fr: { label: 'Nouvelle inscription', detail: 'Test depuis les réglages', tag: 'BIENVENUE' },
      en: { label: 'New sign-up', detail: 'Test from the settings', tag: 'WELCOME' },
    },
  },
  partner: {
    rarity: 'notable',
    text: {
      fr: { label: 'Nouveau partenaire', detail: 'Une intégration de test', tag: 'PARTENAIRE' },
      en: { label: 'New partner', detail: 'A test integration', tag: 'PARTNER' },
    },
  },
  departure: {
    rarity: 'common',
    text: {
      fr: { label: 'Branche supprimée', detail: 'test/reglages', tag: 'SUPPRIMÉE' },
      en: { label: 'Branch deleted', detail: 'test/settings', tag: 'DELETED' },
    },
  },
  approval: {
    rarity: 'notable',
    text: {
      fr: { label: 'Pull request mergée', detail: '#1 Teste les réglages', tag: 'MERGÉE' },
      en: { label: 'Pull request merged', detail: '#1 Tests the settings', tag: 'MERGED' },
    },
  },
  rejection: {
    rarity: 'common',
    text: {
      fr: { label: 'Pull request fermée', detail: '#2 Un essai refusé', tag: 'FERMÉE' },
      en: { label: 'Pull request closed', detail: '#2 A declined attempt', tag: 'CLOSED' },
    },
  },
  abandon: {
    rarity: 'common',
    text: {
      fr: { label: 'Panier abandonné', detail: 'Formule annuelle de test', tag: 'ABANDON' },
      en: { label: 'Cart abandoned', detail: 'Test yearly plan', tag: 'ABANDONED' },
    },
  },
  like: {
    rarity: 'common',
    text: {
      fr: { label: 'Nouvelle étoile', detail: 'Sur le dépôt de test', tag: '+1' },
      en: { label: 'New star', detail: 'On the test repository', tag: '+1' },
    },
  },
  celebration: {
    rarity: 'rare',
    text: {
      fr: { label: 'Cap franchi', detail: '1 000 inscriptions de test', tag: '1 000' },
      en: { label: 'Milestone reached', detail: '1,000 test sign-ups', tag: '1,000' },
    },
  },
  message: {
    rarity: 'common',
    text: {
      fr: { label: 'Nouveau message', detail: 'Une question de test au support', tag: 'MESSAGE' },
      en: { label: 'New message', detail: 'A test question to support', tag: 'MESSAGE' },
    },
  },
  publish: {
    rarity: 'notable',
    text: {
      fr: { label: 'Nouvelle version publiée', detail: 'v0.0.1 de test', tag: 'v0.0.1' },
      en: { label: 'New release published', detail: 'Test v0.0.1', tag: 'v0.0.1' },
    },
  },
  usage: {
    rarity: 'common',
    text: {
      fr: { label: 'Commits poussés', detail: '3 commits de test sur main', tag: '+3' },
      en: { label: 'Commits pushed', detail: '3 test commits on main', tag: '+3' },
    },
  },
  money: {
    rarity: 'notable',
    text: {
      fr: { label: 'Paiement reçu', detail: 'Formule mensuelle de test', tag: '+49 €' },
      en: { label: 'Payment received', detail: 'Test monthly plan', tag: '+€49' },
    },
  },
  error: {
    rarity: 'common',
    text: {
      fr: { label: 'Nouvelle erreur', detail: 'TypeError dans la page de test', tag: 'ERREUR' },
      en: { label: 'New error', detail: 'TypeError on the test page', tag: 'ERROR' },
    },
  },
  blocked: {
    rarity: 'common',
    text: {
      fr: { label: 'Robot bloqué', detail: 'À l’inscription de test', tag: 'BLOQUÉ' },
      en: { label: 'Bot blocked', detail: 'At the test sign-up', tag: 'BLOCKED' },
    },
  },
};

/** The test deploy's words at each step; a failed deploy is the jackpot. */
export const TEST_DEPLOY_TEXT: Readonly<Record<DeployStep, TestEventWords>> = {
  started: {
    rarity: 'notable',
    text: {
      fr: { label: 'Déploiement lancé', detail: 'Version de test vers la production', tag: 'PROD' },
      en: { label: 'Deploy started', detail: 'Test build to production', tag: 'PROD' },
    },
  },
  succeeded: {
    rarity: 'notable',
    text: {
      fr: { label: 'Déploiement réussi', detail: 'Version de test en production', tag: 'PROD' },
      en: { label: 'Deploy succeeded', detail: 'Test build in production', tag: 'PROD' },
    },
  },
  failed: {
    rarity: 'jackpot',
    text: {
      fr: { label: 'Déploiement en échec', detail: 'Version de test refusée par la production', tag: 'PROD' },
      en: { label: 'Deploy failed', detail: 'Test build refused by production', tag: 'PROD' },
    },
  },
};
