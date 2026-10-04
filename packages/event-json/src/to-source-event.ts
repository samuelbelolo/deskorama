import type { EventText, SourceEvent } from '@deskorama/core';
import type { PostedEvent } from './posted-event.ts';

/**
 * Returns the Source Event a validated post describes. Words given in one language only are used for both, the
 * time defaults to `receivedAt`, and the id to `fallbackId`.
 * @example
 * toSourceEvent(posted, Date.UTC(2026, 9, 4, 14), 'local-1').text.fr.label; // the English label if only English came
 */
export function toSourceEvent(posted: PostedEvent, receivedAt: number, fallbackId: string): SourceEvent {
  const en: EventText | undefined = posted.text.en ?? posted.text.fr;
  const fr: EventText | undefined = posted.text.fr ?? posted.text.en;

  if (en === undefined || fr === undefined) throw new Error('A validated Event always has words in one language.');

  const event: SourceEvent = {
    id: posted.id ?? fallbackId,
    kind: posted.kind,
    archetype: posted.archetype,
    recognised: posted.recognised,
    rarity: posted.rarity,
    source: posted.source,
    at: new Date(posted.at === undefined ? receivedAt : Date.parse(posted.at)),
    text: { fr, en },
  };

  return {
    ...event,
    ...(posted.step === undefined ? {} : { step: posted.step }),
    ...(posted.gauge === undefined ? {} : { gauge: posted.gauge }),
  };
}
