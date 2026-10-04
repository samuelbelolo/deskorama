import type { SourceEvent } from '@deskorama/core';
import type { EventBase } from './event-base.ts';

/**
 * Returns the Event of a subscription that starts on a free plan: an arrival, since no money comes in, and no new
 * subscriber counted.
 * @example
 * freePlanStarted(base).text.en; // { label: 'New subscription', detail: 'Free plan', tag: 'FREE' }
 */
export function freePlanStarted(base: EventBase): SourceEvent {
  return {
    ...base,
    archetype: 'arrival',
    rarity: 'common',
    text: {
      fr: { label: 'Nouvel abonnement', detail: 'Formule gratuite', tag: 'GRATUIT' },
      en: { label: 'New subscription', detail: 'Free plan', tag: 'FREE' },
    },
  };
}
