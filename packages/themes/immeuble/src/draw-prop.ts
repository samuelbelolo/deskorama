import { blit } from './blit.ts';
import { LEGEND } from './furniture-sprites.ts';
import { PROPS, type PropName } from './prop-sprites.ts';
import { sprite } from './sprite.ts';

/**
 * Draws one of the Gags' props at native coordinates, `scale` times its size.
 * @example
 * drawProp(ctx, 'COIN', 80, 170, 2);
 */
export function drawProp(ctx: CanvasRenderingContext2D, name: PropName, x: number, y: number, scale = 1): void {
  blit(ctx, sprite(`prop-${name}`, PROPS[name], LEGEND), x, y, { scale });
}
