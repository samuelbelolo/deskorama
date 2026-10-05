import type { ConnectorAbout } from '@deskorama/core';
import { VERCEL_MARK } from './vercel-mark.ts';

/**
 * How the Vercel Connector presents itself: Vercel scopes a token to a team, then to all of its projects or to a
 * single one, and only the first can list the projects and follow several.
 */
export const VERCEL_ABOUT: ConnectorAbout = {
  logo: { ...VERCEL_MARK, markColour: '#fbfbfb', tileColour: '#161618' },
  pitch: {
    fr: 'Chaque mise en ligne\u00a0: lancée, réussie, ratée ou annulée.',
    en: 'Every deploy: started, shipped, failed or cancelled.',
  },
  token: {
    name: { fr: 'Jeton d’accès', en: 'Access token' },
    page: { site: 'Vercel', url: 'https://vercel.com/account/settings/tokens' },
    note: {
      fr: 'Sous «\u00a0Scope\u00a0», choisissez l’équipe, puis «\u00a0All Projects\u00a0».',
      en: 'Under “Scope”, choose the team, then “All Projects”.',
    },
  },
};
