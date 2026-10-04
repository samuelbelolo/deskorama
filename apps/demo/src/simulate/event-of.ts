import type { Random, SourceEvent } from '@deskorama/core';
import type { DemoKind } from '../sources/demo-source.ts';
import type { Stamp } from './stamp.ts';

/**
 * Returns one Event of a fictional Source's kind, as its Connector would report it: the kind's Role, rarity and
 * label, a freshly drawn detail and tag in both languages, and the Gauge move they bring.
 * @example
 * eventOf('Tramlo', TRAMLO.kinds[0], random, { id: 'github-1', at: new Date() });
 * // { id: 'github-1', kind: 'push.main', archetype: 'usage', text: { fr: { label: 'Commits poussés sur main', ... } }, gauge: { role: 'daily', by: 3 }, ... }
 */
export function eventOf(source: string, kind: DemoKind, random: Random, { id, at }: Stamp): SourceEvent {
  const { text, gauge } = kind.draw(random);

  const event: SourceEvent = {
    id,
    kind: kind.kind,
    archetype: kind.archetype,
    recognised: true,
    rarity: kind.rarity,
    source,
    at,
    text: {
      fr: { label: kind.label.fr, ...text.fr },
      en: { label: kind.label.en, ...text.en },
    },
  };

  return gauge === undefined ? event : { ...event, gauge };
}
