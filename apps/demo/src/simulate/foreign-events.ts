import type { SourceEvent } from '@deskorama/core';
import type { Stamp } from './stamp.ts';

/** An Event the visitor can send by hand, without the id and time it gets when sent. */
export type HandEvent = Omit<SourceEvent, keyof Stamp>;

/**
 * Returns the two Events no fictional Source describes, sent from the control panel only: one from another Source,
 * which carries no Role, and one of a kind its Source never described. A Theme plays its generic Gag for both,
 * readable from the Caption alone.
 * @example
 * foreignEvents('Tramlo').map((event) => event.kind); // ["mail.received", "discussion.created"]
 */
export function foreignEvents(source: string): readonly HandEvent[] {
  return [
    {
      kind: 'mail.received',
      archetype: null,
      recognised: true,
      rarity: 'common',
      source: 'Mail',
      text: {
        fr: { label: 'E-mail reçu', detail: 'Comptabilité : « Facture d’octobre »', tag: '' },
        en: { label: 'E-mail received', detail: 'Accounting: “October invoice”', tag: '' },
      },
    },
    {
      kind: 'discussion.created',
      archetype: null,
      recognised: false,
      rarity: 'common',
      source,
      text: {
        fr: { label: 'Événement non reconnu', detail: 'discussion.created', tag: '' },
        en: { label: 'Unrecognised event', detail: 'discussion.created', tag: '' },
      },
    },
  ];
}
