import { KEY_HOLD_MS } from './timing.ts';

/**
 * Returns where a Gag's own timeline stands at `t` ms into the Gag, with its key pose held: it plays up to
 * `keyT`, stays there {@link KEY_HOLD_MS}, then plays the rest.
 * @example
 * paced(1000, 1200); // 1000
 * paced(2500, 1200); // 1200, held
 * paced(4000, 1200); // 1500
 */
export function paced(t: number, keyT: number): number {
  if (t < keyT) return t;

  return t < keyT + KEY_HOLD_MS ? keyT : t - KEY_HOLD_MS;
}
