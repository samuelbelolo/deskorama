import { between } from './between.ts';
import type { DemoSource } from './demo-source.ts';
import { drawPlan } from './draw-plan.ts';
import { drawn } from './drawn.ts';
import { DECLINES, FEATURES, PAGES, PLANS, QUESTIONS, REPORTS, REVIEWS, SECTORS } from './kavelo-words.ts';
import { pick } from './pick.ts';

/**
 * Kavelo, an invented B2B SaaS for team planning and invoicing. Every rate is invented, and details name plans,
 * amounts, team sizes and sectors, never a customer.
 */
export const KAVELO: DemoSource = {
  id: 'saas',
  profile: {
    name: 'Kavelo',
    gauges: {
      crowd: {
        max: 36,
        text: {
          fr: { label: 'Utilisateurs connectés', short: 'EN LIGNE' },
          en: { label: 'Users online', short: 'ONLINE' },
        },
      },
      daily: {
        text: {
          fr: { label: 'Inscriptions aujourd’hui', short: 'INSCRITS' },
          en: { label: 'Sign-ups today', short: 'SIGN-UPS' },
        },
      },
      total: {
        text: {
          fr: { label: 'Clients payants', short: 'CLIENTS' },
          en: { label: 'Paying customers', short: 'CUSTOMERS' },
        },
      },
    },
  },
  title: { fr: 'SaaS B2B', en: 'B2B SaaS' },
  pitch: {
    fr: 'Un logiciel en abonnement branche ses événements : inscriptions, paiements, support, résiliations.',
    en: 'A subscription product plugs in its events: sign-ups, payments, support, cancellations.',
  },
  // Office hours, a small evening tail.
  hourly: [
    0.05, 0.04, 0.03, 0.03, 0.03, 0.05, 0.2, 0.7, 1.4, 1.8, 1.7, 1.5, 1.0, 1.4, 1.7, 1.6, 1.4, 1.1, 0.7, 0.5, 0.35,
    0.25, 0.15, 0.08,
  ],
  gauges: { crowdMedian: 12, dailyPerDay: 32, dailyByEvents: true, totalStart: 418, totalDrift: 0.02 },
  deploys: {
    perDay: 1,
    firstHour: 9,
    lastHour: 18,
    failureChance: 0.03,
    buildMinutes: [2, 5],
    front: ['app', 'site', 'admin'],
    back: ['api', 'billing', 'jobs'],
  },
  kinds: [
    {
      kind: 'user.signed_up',
      archetype: 'arrival',
      rarity: 'common',
      perDay: 32,
      label: { fr: 'Nouvelle inscription', en: 'New sign-up' },
      draw: (random) => {
        const seats = between(random, 2, 14);
        const sector = pick(random, SECTORS);

        return drawn([`Équipe de ${seats}, ${sector.fr}`, 'ESSAI'], [`Team of ${seats}, ${sector.en}`, 'TRIAL'], {
          role: 'daily',
          by: 1,
        });
      },
    },
    {
      kind: 'feature.exported',
      archetype: 'usage',
      rarity: 'common',
      perDay: 18,
      label: { fr: 'Rapport exporté', en: 'Report exported' },
      draw: (random) => {
        const report = pick(random, REPORTS);
        const rows = between(random, 40, 900, 10);
        const format = pick(random, ['CSV', 'PDF']);

        return drawn([`${report.fr}, ${rows} lignes`, format], [`${report.en}, ${rows} rows`, format]);
      },
    },
    {
      kind: 'payment.received',
      archetype: 'money',
      rarity: 'common',
      perDay: 12,
      label: { fr: 'Paiement reçu', en: 'Payment received' },
      draw: (random) => drawPlan(random, false),
    },
    {
      kind: 'trial.expired',
      archetype: 'abandon',
      rarity: 'common',
      perDay: 9,
      label: { fr: 'Essai terminé sans abonnement', en: 'Trial ended without subscribing' },
      draw: (random) => {
        const logins = between(random, 1, 9);
        const plural = logins > 1 ? 's' : '';

        return drawn(
          [`14 jours, ${logins} connexion${plural}`, 'ESSAI'],
          [`14 days, ${logins} login${plural}`, 'TRIAL'],
        );
      },
    },
    {
      kind: 'app.error',
      archetype: 'error',
      rarity: 'common',
      perDay: 5,
      bursty: true,
      label: { fr: 'Erreur dans l’appli', en: 'Error in the app' },
      draw: (random) => {
        const page = pick(random, PAGES);

        return drawn([`Sur la page ${page.fr}`, '500'], [`On the ${page.en} page`, '500']);
      },
    },
    {
      kind: 'payment.failed',
      archetype: 'rejection',
      rarity: 'common',
      perDay: 2,
      label: { fr: 'Paiement refusé', en: 'Payment declined' },
      draw: (random) => {
        const reason = pick(random, DECLINES);
        const plan = pick(random, PLANS).name;

        return drawn([`${reason.fr}, plan ${plan.fr}`, 'REFUSÉ'], [`${reason.en}, ${plan.en} plan`, 'DECLINED']);
      },
    },
    {
      kind: 'trial.converted',
      archetype: 'money',
      rarity: 'notable',
      perDay: 5,
      label: { fr: 'Essai converti en abonnement', en: 'Trial converted to paid' },
      draw: (random) => drawPlan(random, true),
    },
    {
      kind: 'ticket.opened',
      archetype: 'message',
      rarity: 'notable',
      perDay: 7,
      label: { fr: 'Ticket de support ouvert', en: 'Support ticket opened' },
      draw: (random) => {
        const number = `#${between(random, 1180, 1260)}`;
        const question = pick(random, QUESTIONS);

        return drawn([`« ${question.fr} »`, number], [`“${question.en}”`, number]);
      },
    },
    {
      kind: 'ticket.solved',
      archetype: 'approval',
      rarity: 'notable',
      perDay: 6,
      label: { fr: 'Ticket résolu', en: 'Ticket solved' },
      draw: (random) => {
        const minutes = between(random, 4, 45);

        return drawn([`Résolu en ${minutes} min`, 'RÉSOLU'], [`Solved in ${minutes} min`, 'SOLVED']);
      },
    },
    {
      kind: 'review.posted',
      archetype: 'like',
      rarity: 'notable',
      perDay: 2,
      label: { fr: 'Avis 5 étoiles', en: '5-star review' },
      draw: (random) => {
        const review = pick(random, REVIEWS);

        return drawn([`« ${review.fr} »`, '5/5'], [`“${review.en}”`, '5/5']);
      },
    },
    {
      kind: 'signup.bot_blocked',
      archetype: 'blocked',
      rarity: 'notable',
      perDay: 3,
      label: { fr: 'Robot bloqué par le captcha', en: 'Bot stopped by the captcha' },
      draw: () => drawn(['Sur le formulaire d’inscription', 'CAPTCHA'], ['On the sign-up form', 'CAPTCHA']),
    },
    {
      kind: 'subscription.cancelled',
      archetype: 'departure',
      rarity: 'notable',
      perDay: 1.5,
      label: { fr: 'Abonnement résilié', en: 'Subscription cancelled' },
      draw: (random) => {
        const months = between(random, 2, 30);

        return drawn([`Client depuis ${months} mois`, 'RÉSILIÉ'], [`Customer for ${months} months`, 'CANCELLED'], {
          role: 'total',
          by: -1,
        });
      },
    },
    {
      kind: 'enterprise.signed',
      archetype: 'partner',
      rarity: 'notable',
      perDay: 0.6,
      label: { fr: 'Contrat Entreprise signé', en: 'Enterprise contract signed' },
      draw: (random) => {
        const seats = between(random, 20, 120, 10);

        return drawn(
          [`${seats} sièges, facturation annuelle`, `${seats} SIÈGES`],
          [`${seats} seats, billed yearly`, `${seats} SEATS`],
        );
      },
    },
    {
      kind: 'changelog.published',
      archetype: 'publish',
      rarity: 'notable',
      perDay: 0.4,
      label: { fr: 'Nouveauté publiée', en: 'New feature shipped' },
      draw: (random) => {
        const feature = pick(random, FEATURES);

        return drawn([feature.fr, 'NOUVEAU'], [feature.en, 'NEW']);
      },
    },
    {
      kind: 'mrr.milestone',
      archetype: 'celebration',
      rarity: 'rare',
      perDay: 0.15,
      label: { fr: 'Cap des 20 000 € de revenu mensuel', en: '€20,000 monthly revenue reached' },
      draw: () =>
        drawn(['Revenu mensuel récurrent : 20 040 €', '20 K€'], ['Monthly recurring revenue: €20,040', '€20K']),
    },
  ],
};
