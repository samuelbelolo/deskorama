import { CAST, CAST_LEGEND, type CastName } from './people-sprites.ts';
import { sprite } from './sprite.ts';

/**
 * Returns the rendered sprite of one of the building's regulars or visitors.
 * @example
 * castSprite('ROBOT').width; // 7
 */
export function castSprite(name: CastName): HTMLCanvasElement {
  return sprite(`cast-${name}`, CAST[name], CAST_LEGEND);
}
