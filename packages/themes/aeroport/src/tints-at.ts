import { mixHex } from './mix-hex.ts';
import { SKY_KEYS, type TintName, type Tints } from './sky-keys.ts';

/**
 * Returns the poster's tints at a fractional hour, mixed between the two keyframes around it.
 * @example
 * tintsAt(13).sky1; // "#5d9ad2"
 * tintsAt(25).sky1; // the same as tintsAt(1)
 */
export function tintsAt(hour: number): Tints {
  const h = ((hour % 24) + 24) % 24;

  let index = 0;
  while (index < SKY_KEYS.length - 2 && (SKY_KEYS[index + 1]?.hour ?? 24) <= h) index += 1;

  const from = SKY_KEYS[index] ?? SKY_KEYS[0];
  const to = SKY_KEYS[index + 1] ?? from;
  if (from === undefined || to === undefined) throw new Error('The sky has no keyframes.');

  const share = (h - from.hour) / (to.hour - from.hour || 1);
  const mix = (name: TintName): string => mixHex(from.tints[name], to.tints[name], share);

  return {
    sky1: mix('sky1'),
    sky2: mix('sky2'),
    sky3: mix('sky3'),
    sky4: mix('sky4'),
    far: mix('far'),
    cloud: mix('cloud'),
    apron: mix('apron'),
    tarmac: mix('tarmac'),
    grass: mix('grass'),
    facade: mix('facade'),
    glass: mix('glass'),
    sun: mix('sun'),
  };
}
