import { xmlText } from './xml-text.ts';

/** The gate's drawing, 204 x 70; its barrier reaches left from x 74, toward whoever tries to get in. */
export const GATE = { w: 204, h: 70, pivot: 74 } as const;

/**
 * Returns our security gate: a booth, a sign painted with the airport's word for it, and a closed striped barrier.
 * @example
 * gateMarkup('SECURITY').includes('SECURITY'); // true
 */
export function gateMarkup(word: string): string {
  let stripes = '';
  for (let x = 4; x < 70; x += 16) stripes += `<rect class="gate-stripe" x="${x - 74}" y="44" width="8" height="5"/>`;

  return `<svg width="${GATE.w}" height="${GATE.h}" viewBox="-74 0 204 70" overflow="visible">
    <rect class="gate-booth" x="40" y="22" width="46" height="48"/>
    <rect class="gate-window" x="46" y="30" width="34" height="14"/>
    <rect class="gate-post" x="12" y="2" width="3" height="68"/>
    <rect class="gate-sign" x="-14" y="0" width="74" height="17" rx="1"/>
    <text class="gate-sign-text" x="23" y="12" text-anchor="middle">${xmlText(word)}</text>
    <rect class="gate-post" x="0" y="40" width="7" height="30"/>
    <rect class="gate-boom" x="-70" y="44" width="72" height="5"/>
    ${stripes}
  </svg>`;
}
