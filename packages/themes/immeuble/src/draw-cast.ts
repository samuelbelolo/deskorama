import { blit } from './blit.ts';
import { castSprite } from './cast-sprite.ts';
import type { CastName } from './people-sprites.ts';

/**
 * Draws one of the cast at its own size with its feet on a line.
 * @example
 * drawCast(ctx, 'WORKER_A', 200, 51);
 */
export function drawCast(ctx: CanvasRenderingContext2D, name: CastName, x: number, feetY: number, flip = false): void {
  const art = castSprite(name);

  blit(ctx, art, x, feetY - art.height + 1, { flip });
}
