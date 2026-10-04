import { paint } from './paint.ts';
import { PAL } from './palette.ts';

/** The building's street door, in native pixels. */
export const DOOR_W = 11;

/**
 * Draws our street door standing on a line, a little lamp over it: closed wood with its handle, or open on the warm
 * lit hall.
 * @example
 * drawDoor(ctx, 60, 194, false);
 */
export function drawDoor(ctx: CanvasRenderingContext2D, x: number, ground: number, open: boolean): void {
  paint(ctx, x, ground - 25, DOOR_W, 25, PAL.stone2);
  paint(ctx, x + 4, ground - 28, 3, 2, PAL.lamp);
  paint(ctx, x + 2, ground - 23, DOOR_W - 4, 23, open ? PAL.glow : PAL.wood);

  if (open) {
    paint(ctx, x + 2, ground - 23, 2, 23, PAL.wood);
    return;
  }

  paint(ctx, x + 3, ground - 21, DOOR_W - 6, 8, PAL.umber);
  paint(ctx, x + DOOR_W - 4, ground - 11, 1, 2, PAL.lamp);
}
