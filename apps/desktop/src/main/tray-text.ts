import type { ConnectorFailure, Language } from '@deskorama/core';
import { failureText } from '../shared/failure-text.ts';

/** The words of the menu-bar menu. */
export interface TrayText {
  readonly tooltip: string;
  readonly listening: (port: number) => string;
  readonly webhookOff: (port: number) => string;
  readonly copyTestCommand: string;
  readonly pause: string;
  readonly theme: string;
  /** A Theme the app does not ship yet. */
  readonly comingSoon: (theme: string) => string;
  readonly settings: string;
  readonly failing: (name: string, failure: ConnectorFailure) => string;
  readonly newRelease: (tag: string) => string;
  readonly quit: string;
}

/** The menu-bar menu's words in every display language. */
export const TRAY_TEXT: Readonly<Record<Language, TrayText>> = {
  fr: {
    tooltip: 'Deskorama',
    listening: (port) => `Webhook local sur 127.0.0.1:${port}`,
    webhookOff: (port) => `Webhook local arrêté : port ${port} déjà pris`,
    copyTestCommand: 'Copier une commande de test',
    pause: 'Mettre en pause',
    theme: 'Thème',
    comingSoon: (theme) => `${theme} (bientôt)`,
    settings: 'Réglages…',
    failing: (name, failure) => `⚠ ${name} : ${failureText(failure, 'fr')}`,
    newRelease: (tag) => `Télécharger la version ${tag.replace(/^v/, '')}…`,
    quit: 'Quitter Deskorama',
  },
  en: {
    tooltip: 'Deskorama',
    listening: (port) => `Local webhook on 127.0.0.1:${port}`,
    webhookOff: (port) => `Local webhook off: port ${port} is taken`,
    copyTestCommand: 'Copy a test command',
    pause: 'Pause',
    theme: 'Theme',
    comingSoon: (theme) => `${theme} (coming soon)`,
    settings: 'Settings…',
    failing: (name, failure) => `⚠ ${name}: ${failureText(failure, 'en')}`,
    newRelease: (tag) => `Download version ${tag.replace(/^v/, '')}…`,
    quit: 'Quit Deskorama',
  },
};
