import { blit } from './blit.ts';
import { castSprite } from './cast-sprite.ts';
import type { CastName, Pose } from './people-sprites.ts';
import { TENANT_POSES } from './people-sprites.ts';
import { sprite } from './sprite.ts';
import { tenantLegend } from './tenant-legend.ts';

/** Who to draw: one of the cast by name, or a tenant by look and pose. */
export type Who = { readonly name: CastName } | { readonly look: number; readonly pose: Pose };

/**
 * Draws a cast member or a tenant twice their size with their feet on a line, so an actor reads at desk distance.
 * @example
 * drawBig(ctx, { name: 'ROBOT' }, 200, 194);
 * drawBig(ctx, { look: 7, pose: 'PHONE' }, 150, 194, { flip: true });
 */
export function drawBig(
  ctx: CanvasRenderingContext2D,
  who: Who,
  x: number,
  feetY: number,
  options: { readonly flip?: boolean } = {},
): void {
  const art =
    'name' in who
      ? castSprite(who.name)
      : sprite(`${who.pose}-${who.look}`, TENANT_POSES[who.pose], tenantLegend(who.look));

  blit(ctx, art, x, feetY - art.height * 2 + 1, { scale: 2, flip: options.flip ?? false });
}
