import type { Colour } from './palette.ts';
import type { Legend } from './sprite.ts';

const HAIR: readonly Colour[] = ['wood', 'ink', 'lamp', 'umber', 'stone2', 'dawn'];
const SHIRT: readonly Colour[] = ['denim', 'leaf', 'dawn', 'moss', 'paper', 'slate', 'lamp', 'haze'];
const PANTS: readonly Colour[] = ['slate', 'dusk', 'wood', 'denim', 'night'];

/**
 * Returns the colour of a list at a whole number, wrapping round.
 * @example
 * pick(['wood', 'ink'], 3); // "ink"
 */
function pick(list: readonly Colour[], n: number): Colour {
  return list[Math.abs(n) % list.length] ?? 'ink';
}

/**
 * Returns the legend that gives a tenant their hair, shirt, trousers and skin, from a whole number: the same number
 * always dresses the same person.
 * @example
 * tenantLegend(7).h; // "umber"
 */
export function tenantLegend(look: number): Legend {
  return {
    h: pick(HAIR, look),
    s: look % 4 === 3 ? 'skin2' : 'skin',
    e: 'ink',
    c: pick(SHIRT, look >> 1),
    p: pick(PANTS, look >> 2),
    k: 'ink',
    m: 'paper',
    g: 'haze',
    b: 'umber',
  };
}
