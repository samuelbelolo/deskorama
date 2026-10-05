import type { ConnectorAbout } from '@deskorama/core';
import { LINEAR_MARK } from './linear-mark.ts';

/** How the Linear Connector presents itself: personal API keys live in the account's security settings. */
export const LINEAR_ABOUT: ConnectorAbout = {
  logo: { ...LINEAR_MARK, markColour: '#fbfbfb', tileColour: '#5e6ad2' },
  pitch: {
    fr: 'Les issues créées et terminées de l’espace de travail.',
    en: 'Issues created and completed in the workspace.',
  },
  token: {
    name: { fr: 'Clé d’API personnelle', en: 'Personal API key' },
    page: { site: 'Linear', url: 'https://linear.app/settings/account/security' },
    note: {
      fr: 'Créez une clé d’API personnelle limitée à Read. Elle choisit aussi l’espace de travail.',
      en: 'Create a personal API key limited to Read. It also picks the workspace.',
    },
  },
};
