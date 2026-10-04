import type { GaugeMove } from '@deskorama/core';
import type { Drawn } from './demo-source.ts';

/**
 * Returns a drawn detail and tag in French and English, with the Gauge move it brings when there is one.
 * @example
 * drawn(['3 commits sur main', '+3'], ['3 commits on main', '+3'], { role: 'daily', by: 3 });
 * // { text: { fr: { detail: '3 commits sur main', tag: '+3' }, en: { ... } }, gauge: { role: 'daily', by: 3 } }
 */
export function drawn(
  [frDetail, frTag]: readonly [string, string],
  [enDetail, enTag]: readonly [string, string],
  gauge?: GaugeMove,
): Drawn {
  const text = { fr: { detail: frDetail, tag: frTag }, en: { detail: enDetail, tag: enTag } };

  return gauge === undefined ? { text } : { text, gauge };
}
