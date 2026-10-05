import type { ConnectorAbout } from '@deskorama/core';

/** How a test Connector presents itself: a square mark, one line, and a token page on a fictional service. */
export const ABOUT_FIXTURE: ConnectorAbout = {
  logo: { size: 24, path: 'M2 2h20v20H2z', markColour: '#fbfbfb', tileColour: '#58585f' },
  pitch: { fr: 'Ce que le service apporte.', en: 'What the service brings.' },
  token: {
    name: { fr: 'Jeton', en: 'Token' },
    page: { site: 'Tramlo', url: 'https://tramlo.example/settings/tokens' },
    note: { fr: 'Un jeton en lecture seule.', en: 'A read-only token.' },
  },
};
