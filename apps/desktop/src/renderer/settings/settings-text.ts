import type { GaugeRole, Language } from '@deskorama/core';

/** The words of the settings window. */
export interface SettingsText {
  readonly windowTitle: string;
  readonly title: string;
  readonly wallpaper: string;
  readonly theme: string;
  /** A Theme the app does not ship yet. */
  readonly comingSoon: (theme: string) => string;
  readonly language: string;
  readonly systemLanguage: string;
  readonly openAtLogin: string;
  readonly needsApproval: string;
  readonly brand: string;
  /** The choice of a Gauge that follows the Source naming the scene. */
  readonly sameAsBrand: string;
  readonly gauges: Readonly<Record<GaugeRole, string>>;
  readonly sources: string;
  readonly lead: string;
  readonly noSource: string;
  readonly add: (connector: string) => string;
  readonly edit: string;
  readonly remove: string;
  readonly confirmRemove: string;
  readonly name: string;
  readonly namePlaceholder: string;
  readonly token: string;
  readonly keepToken: string;
  readonly permissions: string;
  /** The label of the polling interval, with the Connector's bounds in seconds. */
  readonly interval: (min: string, max: string) => string;
  readonly tests: string;
  readonly testsLead: string;
  readonly test: string;
  readonly testing: string;
  readonly save: string;
  readonly cancel: string;
  readonly waiting: string;
  readonly ok: (time: string) => string;
  readonly noEvent: string;
  readonly latest: string;
  readonly fix: string;
  readonly failed: string;
}

/** The settings window's words in every display language. */
export const SETTINGS_TEXT: Readonly<Record<Language, SettingsText>> = {
  fr: {
    windowTitle: 'Réglages de Deskorama',
    title: 'Réglages',
    wallpaper: 'Fond d’écran',
    theme: 'Thème',
    comingSoon: (theme) => `${theme} (bientôt)`,
    language: 'Langue',
    systemLanguage: 'Celle du Mac',
    openAtLogin: 'Ouvrir Deskorama à l’ouverture de session',
    needsApproval: 'macOS attend votre accord dans Réglages Système › Général › Ouverture.',
    brand: 'Source qui nomme la scène',
    sameAsBrand: 'La Source qui nomme la scène',
    gauges: {
      crowd: 'Compteur « en ce moment » fourni par',
      daily: 'Compteur « aujourd’hui » fourni par',
      total: 'Compteur « au total » fourni par',
    },
    sources: 'Sources',
    lead: 'Chaque Source est interrogée depuis ce Mac avec votre jeton, gardé dans le trousseau macOS.',
    noSource: 'Aucune Source pour l’instant.',
    add: (connector) => `Ajouter : ${connector}`,
    edit: 'Modifier',
    remove: 'Supprimer',
    confirmRemove: 'Confirmer',
    name: 'Nom affiché',
    namePlaceholder: 'Tramlo',
    token: 'Jeton',
    keepToken: 'Laisser vide pour garder le jeton actuel',
    permissions: 'Le jeton a besoin de :',
    interval: (min, max) => `Intervalle de lecture, en secondes (de ${min} à ${max})`,
    tests: 'Événements de test',
    testsLead: 'Joue l’animation de chaque rôle sur le fond d’écran, sans attendre un vrai événement.',
    test: 'Tester',
    testing: 'Test en cours…',
    save: 'Enregistrer',
    cancel: 'Annuler',
    waiting: 'Première lecture en cours…',
    ok: (time) => `Lu à ${time}`,
    noEvent: 'Connexion réussie, aucun événement pour l’instant.',
    latest: 'Derniers événements :',
    fix: 'Corrigez les champs en rouge.',
    failed: 'Ça n’a pas marché : réessayez.',
  },
  en: {
    windowTitle: 'Deskorama Settings',
    title: 'Settings',
    wallpaper: 'Wallpaper',
    theme: 'Theme',
    comingSoon: (theme) => `${theme} (coming soon)`,
    language: 'Language',
    systemLanguage: 'The Mac’s own',
    openAtLogin: 'Open Deskorama at login',
    needsApproval: 'macOS waits for your approval in System Settings › General › Login Items.',
    brand: 'Source that names the scene',
    sameAsBrand: 'The Source that names the scene',
    gauges: {
      crowd: '“Right now” Gauge fed by',
      daily: '“Today” Gauge fed by',
      total: '“In total” Gauge fed by',
    },
    sources: 'Sources',
    lead: 'Each Source is polled from this Mac with your token, kept in the macOS Keychain.',
    noSource: 'No Source yet.',
    add: (connector) => `Add: ${connector}`,
    edit: 'Edit',
    remove: 'Remove',
    confirmRemove: 'Confirm',
    name: 'Display name',
    namePlaceholder: 'Tramlo',
    token: 'Token',
    keepToken: 'Leave empty to keep the current token',
    permissions: 'The token needs:',
    interval: (min, max) => `Polling interval, in seconds (${min} to ${max})`,
    tests: 'Test Events',
    testsLead: 'Plays each Role’s animation on the wallpaper, without waiting for a real Event.',
    test: 'Test',
    testing: 'Testing…',
    save: 'Save',
    cancel: 'Cancel',
    waiting: 'Reading it for the first time…',
    ok: (time) => `Read at ${time}`,
    noEvent: 'Connected, no Event yet.',
    latest: 'Latest Events:',
    fix: 'Fix the fields in red.',
    failed: 'That did not work: try again.',
  },
};
