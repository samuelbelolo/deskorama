import type { Words } from './demo-source.ts';

/** The sectors of Kavelo's invented customers: a sector, never a company. */
export const SECTORS: readonly Words[] = [
  { fr: 'cabinet d’architectes', en: 'architecture firm' },
  { fr: 'agence web', en: 'web agency' },
  { fr: 'clinique vétérinaire', en: 'veterinary clinic' },
  { fr: 'école de musique', en: 'music school' },
  { fr: 'bureau d’études', en: 'engineering office' },
  { fr: 'salle de sport', en: 'gym' },
];

/** Its plans and their monthly price, in euros. */
export const PLANS: readonly { readonly name: Words; readonly price: number }[] = [
  { name: { fr: 'Solo', en: 'Solo' }, price: 19 },
  { name: { fr: 'Pro', en: 'Pro' }, price: 49 },
  { name: { fr: 'Équipe', en: 'Team' }, price: 129 },
];

/** Questions its support receives. */
export const QUESTIONS: readonly Words[] = [
  { fr: 'Comment ajouter un collègue ?', en: 'How do I add a colleague?' },
  { fr: 'Peut-on exporter vers la compta ?', en: 'Can we export to our accounting tool?' },
  { fr: 'Où changer la date de facturation ?', en: 'Where do I change the billing date?' },
  { fr: 'L’agenda ne se synchronise plus', en: 'The calendar stopped syncing' },
];

/** The reports its users export. */
export const REPORTS: readonly Words[] = [
  { fr: 'Planning du mois', en: 'Monthly schedule' },
  { fr: 'Factures du trimestre', en: 'Quarterly invoices' },
  { fr: 'Heures par projet', en: 'Hours per project' },
];

/** The pages of its app. */
export const PAGES: readonly Words[] = [
  { fr: 'Facturation', en: 'Billing' },
  { fr: 'Planning', en: 'Schedule' },
  { fr: 'Équipe', en: 'Team' },
  { fr: 'Réglages', en: 'Settings' },
];

/** Five-star reviews it receives. */
export const REVIEWS: readonly Words[] = [
  { fr: 'Enfin un planning que l’équipe utilise', en: 'Finally a schedule the team actually uses' },
  { fr: 'On a gagné deux heures par semaine', en: 'We save two hours a week' },
  { fr: 'Le support répond en dix minutes', en: 'Support answers in ten minutes' },
];

/** Features it ships. */
export const FEATURES: readonly Words[] = [
  { fr: 'Agenda partagé entre équipes', en: 'Shared calendar across teams' },
  { fr: 'Relances de paiement automatiques', en: 'Automatic payment reminders' },
  { fr: 'Appli mobile hors ligne', en: 'Offline mobile app' },
];

/** Why a card payment is declined. */
export const DECLINES: readonly Words[] = [
  { fr: 'Carte expirée', en: 'Card expired' },
  { fr: 'Provision insuffisante', en: 'Insufficient funds' },
];
