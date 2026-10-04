import type { Words } from './demo-source.ts';

/** A kind of home listed on Bailix, the invented rental app, with its usual rent and how common it is. */
export interface ListingType {
  /** Its name in a detail line. */
  readonly name: Words;
  /** Its name on a short tag. */
  readonly short: Words;
  /** "un studio", "a studio": for a sentence. */
  readonly article: Words;
  readonly rent: readonly [number, number];
  readonly weight: number;
}

/** The kinds of home on Bailix. */
export const LISTING_TYPES: readonly ListingType[] = [
  {
    name: { fr: 'Studio', en: 'Studio' },
    short: { fr: 'STUDIO', en: 'STUDIO' },
    article: { fr: 'un studio', en: 'a studio' },
    rent: [480, 720],
    weight: 3,
  },
  {
    name: { fr: 'T2', en: '2-room flat' },
    short: { fr: 'T2', en: '2-ROOM' },
    article: { fr: 'un T2', en: 'a 2-room flat' },
    rent: [650, 980],
    weight: 4,
  },
  {
    name: { fr: 'T3', en: '3-room flat' },
    short: { fr: 'T3', en: '3-ROOM' },
    article: { fr: 'un T3', en: 'a 3-room flat' },
    rent: [820, 1350],
    weight: 2,
  },
  {
    name: { fr: 'Colocation', en: 'Flatshare' },
    short: { fr: 'COLOC', en: 'SHARE' },
    article: { fr: 'une colocation', en: 'a flatshare' },
    rent: [420, 640],
    weight: 1,
  },
];

/** Cities and districts: places, never addresses. */
export const CITIES: readonly string[] = [
  'Paris 11e',
  'Lyon 3e',
  'Nantes',
  'Bordeaux',
  'Lille',
  'Toulouse',
  'Marseille 6e',
  'Rennes',
  'Montpellier',
  'Grenoble',
];

/** The steps of a rental file. */
export const FILE_STEPS: readonly Words[] = [
  { fr: 'identité', en: 'identity' },
  { fr: 'situation pro', en: 'job' },
  { fr: 'revenus', en: 'income' },
  { fr: 'garant', en: 'guarantor' },
  { fr: 'justificatifs', en: 'documents' },
];

/** Tenant profiles of an approved rental file. */
export const PROFILES: readonly Words[] = [
  { fr: 'CDI, avec garant', en: 'permanent job, with a guarantor' },
  { fr: 'étudiant, avec garant', en: 'student, with a guarantor' },
  { fr: 'CDI, sans garant', en: 'permanent job, no guarantor' },
  { fr: 'indépendant, avec garant', en: 'self-employed, with a guarantor' },
];

/** The pages of its website. */
export const PAGES: readonly Words[] = [
  { fr: 'Recherche', en: 'Search' },
  { fr: 'Annonce', en: 'Listing' },
  { fr: 'Dossier', en: 'Rental file' },
  { fr: 'Messagerie', en: 'Messages' },
];

/** What tenants ask landlords. */
export const QUESTIONS: readonly Words[] = [
  { fr: 'C’est toujours disponible ?', en: 'Is it still available?' },
  { fr: 'Les charges sont comprises ?', en: 'Are charges included?' },
  { fr: 'Une visite samedi ?', en: 'A viewing on Saturday?' },
  { fr: 'Les animaux sont acceptés ?', en: 'Are pets allowed?' },
];

/** The documents it exports. */
export const DOCUMENTS: readonly Words[] = [
  { fr: 'Dossier locataire', en: 'Tenant file' },
  { fr: 'Fiche annonce', en: 'Listing sheet' },
];
