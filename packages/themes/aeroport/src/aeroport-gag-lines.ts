import type { ThemeAbout } from '@deskorama/core';

/** What L'Aéroport plays for each Role and for the failed deploy: one short sentence in each display language. */
export const AEROPORT_GAG_LINES: ThemeAbout['gags'] = {
  arrival: {
    fr: 'Un Cub atterrit et dépose son passager.',
    en: 'A Cub lands and drops off its passenger.',
  },
  partner: {
    fr: 'Une recrue arrive, accueillie par une pancarte.',
    en: 'A new recruit walks in, met with a placard.',
  },
  departure: {
    fr: 'Un Cub décolle, salué par un agent de piste.',
    en: 'A Cub takes off, waved away by the ground crew.',
  },
  approval: {
    fr: 'Le tampon orange claque sur le nom.',
    en: 'The orange stamp slams onto the name.',
  },
  rejection: {
    fr: 'Une valise rejoint les bagages refusés.',
    en: 'A suitcase joins the refused luggage.',
  },
  abandon: {
    fr: 'Une carte d’embarquement se déchire en deux.',
    en: 'A boarding pass tears in two.',
  },
  like: {
    fr: 'Un passager lâche un ballon en forme de pouce.',
    en: 'A passenger lets go of a thumbs-up balloon.',
  },
  celebration: {
    fr: 'Le jet doré passe, le seul or de la scène.',
    en: 'The golden jet flies by, the scene’s only gold.',
  },
  message: {
    fr: 'Le message passe à la radio, le sol répond.',
    en: 'The message goes out by radio, the ground replies.',
  },
  publish: {
    fr: 'Un agent hisse un drapeau orange.',
    en: 'An agent hoists an orange flag.',
  },
  usage: {
    fr: 'Un Cub tire une banderole.',
    en: 'A Cub tows a banner.',
  },
  money: {
    fr: 'Un fourgon dépose un sac qui éclate en pièces.',
    en: 'A van drops a sack that bursts into coins.',
  },
  error: {
    fr: 'Des pigeons se posent sur la piste.',
    en: 'Pigeons settle on the runway.',
  },
  blocked: {
    fr: 'Un intrus est arrêté à notre contrôle.',
    en: 'An intruder is stopped at our gate.',
  },
  deploy: {
    fr: 'Le vol PROD s’aligne et décolle.',
    en: 'The PROD flight lines up and takes off.',
  },
  'failed-deploy': {
    fr: 'Vol annulé\u00a0: pompiers, grand panneau, piste fermée.',
    en: 'Flight cancelled: fire truck, big board, runway shut.',
  },
};
