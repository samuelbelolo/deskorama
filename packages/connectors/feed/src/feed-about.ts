import type { ConnectorAbout } from '@deskorama/core';
import { FEED_MARK } from './feed-mark.ts';

/** How the Feed presents itself: its token is whatever the person's own backend expects, so no page creates it. */
export const FEED_ABOUT: ConnectorAbout = {
  logo: { ...FEED_MARK, markColour: '#fbfbfb', tileColour: '#7c7c84' },
  pitch: {
    fr: 'Votre propre backend, qui renvoie le JSON documenté.',
    en: 'Your own backend, returning the documented JSON.',
  },
  token: {
    name: { fr: 'Jeton de votre backend', en: 'Your backend’s token' },
    page: null,
    note: {
      fr: 'Le jeton que votre backend attend en Authorization: Bearer.',
      en: 'The token your backend expects as Authorization: Bearer.',
    },
  },
};
