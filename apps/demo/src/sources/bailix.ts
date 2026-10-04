import { DOCUMENTS, FILE_STEPS, PAGES, PROFILES, QUESTIONS } from './bailix-words.ts';
import { between } from './between.ts';
import type { DemoKind, DemoSource } from './demo-source.ts';
import { drawListing } from './draw-listing.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';

/**
 * Returns a kind of Event about one listing a tenant reacts to: the listing as its detail and its tag.
 * @example
 * listingKind('listing.liked', 'like', 'notable', 6, { fr: 'Annonce likée', en: 'Listing liked' }).draw(random).text.fr;
 * // { detail: 'T2, Lyon 3e, 780 €', tag: 'T2 780 €' }
 */
function listingKind(
  kind: string,
  archetype: DemoKind['archetype'],
  rarity: DemoKind['rarity'],
  perDay: number,
  label: DemoKind['label'],
): DemoKind {
  return {
    kind,
    archetype,
    rarity,
    perDay,
    label,
    draw: (random) => {
      const listing = drawListing(random);

      return drawn([listing.detail.fr, listing.tag.fr], [listing.detail.en, listing.tag.en]);
    },
  };
}

/**
 * Bailix, an invented consumer rental app: tenants swipe listings and build a rental file, landlords publish. Every
 * rate is invented, and details name kinds of homes, cities, rents and counts, never a person.
 */
export const BAILIX: DemoSource = {
  id: 'bailix',
  profile: {
    name: 'Bailix',
    gauges: {
      crowd: {
        max: 36,
        text: {
          fr: { label: 'Personnes sur Bailix maintenant', short: 'EN LIGNE' },
          en: { label: 'People on Bailix right now', short: 'ONLINE' },
        },
      },
      daily: {
        text: {
          fr: { label: 'Visiteurs du site aujourd’hui', short: 'VISITEURS' },
          en: { label: 'Website visitors today', short: 'VISITORS' },
        },
      },
      total: {
        text: {
          fr: { label: 'Annonces en ligne', short: 'ANNONCES' },
          en: { label: 'Listings online', short: 'LISTINGS' },
        },
      },
    },
  },
  title: { fr: 'Appli grand public', en: 'Consumer app' },
  pitch: {
    fr: 'Une appli de location inventée branche ses événements : locataires, annonces, dossiers, bailleurs.',
    en: 'A made-up rental app plugs in its events: tenants, listings, rental files, landlords.',
  },
  // A morning rush when people check new listings, then a steady day.
  hourly: [
    0.25, 0.18, 0.12, 0.1, 0.1, 0.14, 0.35, 0.95, 1.6, 1.4, 1.15, 1.05, 1.2, 1.1, 1.0, 1.05, 1.1, 1.15, 1.05, 0.95,
    0.85, 0.7, 0.5, 0.35,
  ],
  gauges: {
    crowdMedian: 7,
    crowdPeak: { from: 8, to: 8.35, factor: 3 },
    dailyPerDay: 640,
    dailyByEvents: false,
    totalStart: 1260,
    totalDrift: 0.05,
  },
  deploys: {
    perDay: 0.8,
    firstHour: 9,
    lastHour: 18,
    failureChance: 0.03,
    buildMinutes: [2, 5],
    front: ['website', 'dashboard', 'backoffice'],
    back: ['api', 'jobs', 'worker'],
  },
  kinds: [
    listingKind('listing.disliked', 'rejection', 'common', 55, {
      fr: 'Annonce refusée par un locataire',
      en: 'Listing turned down by a tenant',
    }),
    {
      kind: 'app.installed',
      archetype: 'arrival',
      rarity: 'common',
      perDay: 48,
      label: { fr: 'Appli Bailix installée', en: 'Bailix app installed' },
      draw: (random) =>
        random.next() < 0.62
          ? drawn(['Sur iPhone', 'APPLI'], ['On an iPhone', 'APP'])
          : drawn(['Sur Android', 'APPLI'], ['On Android', 'APP']),
    },
    {
      kind: 'user.registered',
      archetype: 'arrival',
      rarity: 'common',
      perDay: 38,
      label: { fr: 'Nouvel inscrit', en: 'New sign-up' },
      draw: (random) => {
        const { type, city } = drawListing(random);

        return drawn(
          [`Cherche ${type.article.fr} à ${city}`, 'INSCRIT'],
          [`Looking for ${type.article.en} in ${city}`, 'SIGN-UP'],
        );
      },
    },
    {
      kind: 'search.alert_created',
      archetype: 'usage',
      rarity: 'common',
      perDay: 20,
      label: { fr: 'Alerte de recherche créée', en: 'Search alert created' },
      draw: (random) => {
        const { type, city, rent } = drawListing(random);
        const most = Math.ceil(rent / 100) * 100;

        return drawn(
          [`${type.name.fr} à ${city}, moins de ${most} €`, 'ALERTE'],
          [`${type.name.en} in ${city}, under €${most}`, 'ALERT'],
        );
      },
    },
    {
      kind: 'rental_file.abandoned',
      archetype: 'abandon',
      rarity: 'common',
      perDay: 14,
      label: { fr: 'Dossier de location abandonné', en: 'Rental file abandoned' },
      draw: (random) => {
        const step = pick(random, FILE_STEPS);

        return drawn([`Abandonné à l’étape ${step.fr}`, 'DOSSIER'], [`Stopped at the ${step.en} step`, 'FILE']);
      },
    },
    {
      kind: 'frontend.error',
      archetype: 'error',
      rarity: 'common',
      perDay: 6,
      bursty: true,
      label: { fr: 'Erreur sur le site', en: 'Error on the website' },
      draw: (random) => {
        const page = pick(random, PAGES);

        return drawn([`Sur la page ${page.fr}`, 'ERREUR'], [`On the ${page.en} page`, 'ERROR']);
      },
    },
    {
      kind: 'rental_file.approved',
      archetype: 'approval',
      rarity: 'notable',
      perDay: 11,
      label: { fr: 'Dossier de location validé', en: 'Rental file approved' },
      draw: (random) => {
        const profile = pick(random, PROFILES);

        return drawn([`Profil : ${profile.fr}`, 'VALIDÉ'], [`Profile: ${profile.en}`, 'APPROVED']);
      },
    },
    {
      kind: 'chat.message_sent',
      archetype: 'message',
      rarity: 'notable',
      perDay: 7,
      label: { fr: 'Message envoyé à un bailleur', en: 'Message sent to a landlord' },
      draw: (random) => {
        const question = pick(random, QUESTIONS);

        return drawn([`« ${question.fr} »`, 'MESSAGE'], [`“${question.en}”`, 'MESSAGE']);
      },
    },
    listingKind('listing.liked', 'like', 'notable', 6, {
      fr: 'Annonce likée par un locataire',
      en: 'Listing liked by a tenant',
    }),
    {
      kind: 'landlord.signed_up',
      archetype: 'partner',
      rarity: 'notable',
      perDay: 5,
      label: { fr: 'Nouveau bailleur inscrit', en: 'New landlord signed up' },
      draw: (random) => {
        const homes = between(random, 1, 3);
        const { city } = drawListing(random);
        const plural = homes > 1 ? 's' : '';

        return drawn(
          [`${homes} logement${plural} à ${city}`, `${homes} LOGEMENT${plural.toUpperCase()}`],
          [`${homes} home${plural} in ${city}`, `${homes} HOME${plural.toUpperCase()}`],
        );
      },
    },
    {
      kind: 'pdf.exported',
      archetype: 'usage',
      rarity: 'notable',
      perDay: 4,
      label: { fr: 'PDF exporté', en: 'PDF exported' },
      draw: (random) => {
        const document = pick(random, DOCUMENTS);

        return drawn([document.fr, 'PDF'], [document.en, 'PDF']);
      },
    },
    {
      kind: 'listing.published',
      archetype: 'publish',
      rarity: 'notable',
      perDay: 3.5,
      label: { fr: 'Nouvelle annonce publiée', en: 'New listing published' },
      draw: (random) => {
        const listing = drawListing(random);

        return drawn([listing.detail.fr, 'À LOUER'], [listing.detail.en, 'TO LET'], { role: 'total', by: 1 });
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
      kind: 'account.deleted',
      archetype: 'departure',
      rarity: 'notable',
      perDay: 2.5,
      label: { fr: 'Compte supprimé', en: 'Account deleted' },
      draw: (random) => {
        const months = between(random, 1, 11);
        const plural = months > 1 ? 's' : '';

        return drawn([`Inscrit depuis ${months} mois`, 'SUPPRIMÉ'], [`Member for ${months} month${plural}`, 'DELETED']);
      },
    },
    listingKind('listing.superliked', 'celebration', 'rare', 0.4, {
      fr: 'Superlike sur une annonce',
      en: 'Listing superliked',
    }),
  ],
};
