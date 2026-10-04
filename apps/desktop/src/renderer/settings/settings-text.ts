import type { Language } from '@deskorama/core';

/** The words of the settings window. */
export interface SettingsText {
  readonly windowTitle: string;
  readonly title: string;
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
    title: 'Sources',
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
    title: 'Sources',
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
