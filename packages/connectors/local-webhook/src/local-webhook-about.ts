import type { ConnectorCard } from '@deskorama/core';
import { LOCAL_WEBHOOK_MARK } from './local-webhook-mark.ts';

/** How the Local webhook presents itself in the settings window: its tile, and where it listens. */
export const LOCAL_WEBHOOK_ABOUT: ConnectorCard = {
  logo: { ...LOCAL_WEBHOOK_MARK, markColour: '#fbfbfb', tileColour: '#58585f' },
  pitch: {
    fr: 'Écoute sur 127.0.0.1 et ::1, jamais sur le réseau.',
    en: 'Listens on 127.0.0.1 and ::1, never on the network.',
  },
};
