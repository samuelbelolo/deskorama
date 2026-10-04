import { blit } from './blit.ts';
import { dimToner } from './dim-toner.ts';
import { dither } from './dither.ts';
import { drawText } from './draw-text.ts';
import { FURNITURE, LEGEND } from './furniture-sprites.ts';
import { LIT } from './lit.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { TENANT_POSES, type Pose } from './people-sprites.ts';
import { sprite } from './sprite.ts';
import { tenantLegend } from './tenant-legend.ts';
import type { Tenant } from './tenant.ts';

/**
 * Draws a tenant in their room: walking, cheering with a hop, in their pose, or on the sofa in front of the TV and
 * its blue glow in the deep night, with a red "!" over their head while they are alarmed. A constant `now` holds the
 * TV's picture still.
 * @example
 * drawTenant(ctx, tenant, { now, nightTv: false });
 */
export function drawTenant(
  ctx: CanvasRenderingContext2D,
  tenant: Tenant,
  at: { readonly now: number; readonly nightTv: boolean },
): void {
  if (at.nightTv) drawTvGlow(ctx, tenant, at.now);

  const walking = tenant.x !== tenant.targetX;
  const cheering = at.now < tenant.cheerUntil;
  let pose: Pose = tenant.pose;
  if (cheering) pose = 'ARMS_UP';
  else if (walking) pose = tenant.frame % 2 === 1 ? 'WALK_A' : 'WALK_B';
  else if (at.nightTv) pose = 'SIT';

  const tone = at.nightTv ? dimToner('night') : LIT;
  const art = sprite(
    `${pose}-${tenant.look}`,
    TENANT_POSES[pose],
    tenantLegend(tenant.look),
    tone,
    at.nightTv ? 'tv' : 'day',
  );
  const hop = cheering && Math.floor(at.now / 200) % 2 === 0 ? 2 : 0;

  const top = tenant.room.floorY - 1 - art.height - hop;
  blit(ctx, art, tenant.x, top, { flip: (walking || at.nightTv) && tenant.dir < 0 });

  if (at.now < tenant.alarmUntil) drawText(ctx, '!', tenant.x + 1, Math.max(tenant.room.y + 1, top - 7), PAL.accent);
}

/**
 * Draws the insomniac's TV beside them and its blue glow on the dark wall; the picture changes every 1.5 s.
 * @example
 * drawTvGlow(ctx, tenant, now);
 */
function drawTvGlow(ctx: CanvasRenderingContext2D, tenant: Tenant, now: number): void {
  const { room } = tenant;
  const right = tenant.x + 16 <= room.x + room.w - 2;
  const tvX = right ? tenant.x + 9 : tenant.x - 9;
  const floor = room.floorY - 1;

  dither(ctx, tvX - 4, room.y + 4, 15, floor - room.y - 4, PAL.night, PAL.dusk);
  paint(ctx, tvX - 1, room.y + 9, 9, floor - room.y - 9, PAL.dusk);
  blit(ctx, sprite('TV_ON', FURNITURE.TV_ON, LEGEND), tvX, floor - FURNITURE.TV_ON.length);
  if (Math.floor(now / 1500) % 2 === 1) paint(ctx, tvX + 1, floor - 5, 5, 2, PAL.haze);

  tenant.dir = right ? 1 : -1;
}
