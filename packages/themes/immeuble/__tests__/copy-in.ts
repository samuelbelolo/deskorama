import type { Language } from '@deskorama/core';
import { createFakeScreenHost } from '@deskorama/test-utils';
import { createCopy, type Copy } from '../src/create-copy.ts';

/**
 * Returns the words of a screen in one language for the fictional Source of the fixtures, or for its name and
 * Gauge words when given.
 * @example
 * copyIn('fr').fill(copyIn('fr').text.board.title); // "SUR TRAMLO"
 */
export function copyIn(
  lang: Language,
  source?: { readonly name: string; readonly words?: Readonly<Record<'crowd' | 'daily' | 'total', string>> },
): Copy {
  const host = createFakeScreenHost({ lang });
  if (source === undefined) return createCopy(host);

  const gauge = (role: 'crowd' | 'daily' | 'total'): { label: string; short: string } => {
    const word = source.words?.[role] ?? host.source.gauges[role].short;
    return { label: word, short: word };
  };
  const gauges = {
    crowd: { ...gauge('crowd'), max: host.source.gauges.crowd.max },
    daily: gauge('daily'),
    total: gauge('total'),
  };

  return createCopy({ ...host, source: { name: source.name, gauges } });
}
