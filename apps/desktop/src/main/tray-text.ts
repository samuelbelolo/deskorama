import type { ConnectorFailure, Language } from '@deskorama/core';
import { failureText } from '../shared/failure-text.ts';

/** The words of the menu-bar menu. */
export interface TrayText {
  readonly tooltip: string;
  readonly listening: (port: number) => string;
  readonly webhookOff: (port: number) => string;
  /** The person turned the Local webhook off. */
  readonly webhookDisabled: string;
  readonly copyTestCommand: string;
  readonly pause: string;
  readonly theme: string;
  /** A Theme the app does not ship yet. */
  readonly comingSoon: (theme: string) => string;
  readonly settings: string;
  readonly failing: (name: string, failure: ConnectorFailure) => string;
  readonly newRelease: (tag: string) => string;
  /** Asks GitHub for a newer release now. */
  readonly checkForRelease: string;
  readonly checkingForRelease: string;
  /** The last check found nothing newer; choosing it checks again. */
  readonly noNewRelease: string;
  /** The last check got no answer from GitHub; choosing it checks again. */
  readonly releaseUnreachable: string;
  readonly quit: string;
}

/** The menu-bar menu's words in every display language. */
export const TRAY_TEXT: Readonly<Record<Language, TrayText>> = {
  fr: {
    tooltip: 'Deskorama',
    listening: (port) => `Webhook local sur 127.0.0.1:${port}`,
    webhookOff: (port) => `Webhook local arrêté : port ${port} déjà pris`,
    webhookDisabled: 'Webhook local désactivé',
    copyTestCommand: 'Copier une commande de test',
    pause: 'Mettre en pause',
    theme: 'Thème',
    comingSoon: (theme) => `${theme} (bientôt)`,
    settings: 'Réglages…',
    failing: (name, failure) => `⚠ ${name} : ${failureText(failure, 'fr')}`,
    newRelease: (tag) => `Télécharger la version ${tag.replace(/^v/, '')}…`,
    checkForRelease: 'Rechercher une mise à jour',
    checkingForRelease: 'Recherche d’une mise à jour…',
    noNewRelease: 'Aucune nouvelle version · Rechercher à nouveau',
    releaseUnreachable: 'GitHub injoignable · Réessayer',
    quit: 'Quitter Deskorama',
  },
  en: {
    tooltip: 'Deskorama',
    listening: (port) => `Local webhook on 127.0.0.1:${port}`,
    webhookOff: (port) => `Local webhook off: port ${port} is taken`,
    webhookDisabled: 'Local webhook turned off',
    copyTestCommand: 'Copy a test command',
    pause: 'Pause',
    theme: 'Theme',
    comingSoon: (theme) => `${theme} (coming soon)`,
    settings: 'Settings…',
    failing: (name, failure) => `⚠ ${name}: ${failureText(failure, 'en')}`,
    newRelease: (tag) => `Download version ${tag.replace(/^v/, '')}…`,
    checkForRelease: 'Check for updates',
    checkingForRelease: 'Checking for updates…',
    noNewRelease: 'No new version · Check again',
    releaseUnreachable: 'GitHub unreachable · Try again',
    quit: 'Quit Deskorama',
  },
};
