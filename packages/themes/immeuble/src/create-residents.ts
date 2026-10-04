import type { ScreenHost } from '@deskorama/core';
import { drawTenant } from './draw-tenant.ts';
import { homeX } from './home-x.ts';
import { isNightTv } from './is-night-tv.ts';
import type { Pose } from './people-sprites.ts';
import type { Room } from './room.ts';
import { settleTenants } from './settle-tenants.ts';
import type { Tenant } from './tenant.ts';

/** How long a tenant takes for one native pixel of walking. */
const STEP_MS = 160;

/** The people at home on one screen: one lit room per person in the crowd, in an honest share of the visible rooms. */
export interface Residents {
  /** Houses `count` people, `density` of the visible rooms lit; true when the lit rooms changed. */
  setCount(count: number, density: number): boolean;
  /** Settles everyone again after the windows moved: the same counts, the rooms you can see first. */
  rebalance(): boolean;
  /** The rooms someone is home in. */
  litIds(): ReadonlySet<string>;
  /** Makes the tenant of a room jump with their arms up until a Clock time. */
  cheer(roomId: string, until: number): void;
  /** Pops a red "!" over every tenant's head until a Clock time; nothing under reduced motion. */
  alarm(until: number): void;
  /** Steps everyone; true when anyone moved, so the frame needs drawing. */
  update(now: number, hour: number): boolean;
  draw(ctx: CanvasRenderingContext2D, now: number, hour: number): void;
}

/**
 * Returns the residents of one screen. They stroll a few pixels now and then, take their coffee in the morning and
 * sit before the TV at night; with reduced motion they stand still.
 * @example
 * const residents = createResidents(rooms, host);
 * residents.setCount(9, 9 / 14); // true: nine flats light up
 */
export function createResidents(rooms: readonly Room[], host: ScreenHost): Residents {
  const tenants = new Map<string, Tenant>();
  let serial = 0;
  let last = { count: 0, density: 0 };

  const settle = (): boolean => {
    const changed = settleTenants(tenants, { host, rooms, ...last, nextLook: () => (serial += 1) * 7 });
    for (const tenant of tenants.values()) {
      tenant.targetX = homeX(host, tenant.room);
      if (host.reducedMotion) tenant.x = tenant.targetX;
    }

    return changed;
  };

  return {
    setCount(count, density) {
      last = { count, density };
      return settle();
    },
    rebalance: settle,
    litIds: () => new Set(tenants.keys()),
    cheer(roomId, until) {
      const tenant = tenants.get(roomId);
      if (tenant !== undefined && !host.reducedMotion) tenant.cheerUntil = until;
    },
    alarm(until) {
      // Still tenants are drawn at a constant instant, so an alarm would never end: they keep calm.
      if (host.reducedMotion) return;
      for (const tenant of tenants.values()) tenant.alarmUntil = until;
    },
    update(now, hour) {
      if (host.reducedMotion) return false;

      let moved = false;
      for (const tenant of tenants.values()) moved = step(tenant, now, hour, host) || moved;

      return moved;
    },
    draw(ctx, now, hour) {
      const still = host.reducedMotion ? 0 : now;
      for (const tenant of tenants.values()) drawTenant(ctx, tenant, { now: still, nightTv: isNightTv(hour) });
    },
  };
}

/**
 * Moves one tenant a pixel toward where they are going, or now and then picks a new pose and a short stroll.
 * Returns true when they moved.
 * @example
 * step(tenant, now, 14, host);
 */
function step(tenant: Tenant, now: number, hour: number, host: ScreenHost): boolean {
  if (now < tenant.nextAt) return false;

  if (tenant.x !== tenant.targetX) {
    tenant.dir = tenant.targetX > tenant.x ? 1 : -1;
    tenant.x += tenant.dir;
    tenant.frame += 1;
    tenant.nextAt = now + STEP_MS;
    return true;
  }

  if (isNightTv(hour)) {
    tenant.nextAt = now + 60_000;
    return false;
  }

  tenant.pose = pickPose(hour, tenant.look, host.random.next());
  const lo = tenant.room.x + 3;
  const hi = tenant.room.x + tenant.room.w - 8;
  tenant.targetX = Math.max(lo, Math.min(hi, tenant.x + Math.round((host.random.next() - 0.5) * 10)));
  tenant.nextAt = now + 20_000 + host.random.next() * 20_000;

  return true;
}

/**
 * Returns a standing pose for the hour: a coffee mug in the morning, the phone or nothing the rest of the day.
 * @example
 * pickPose(8, 3, 0.5); // "MUG"
 */
function pickPose(hour: number, look: number, draw: number): Pose {
  if (hour >= 6.5 && hour < 10.5) return 'MUG';

  return (look + Math.floor(draw * 3)) % 3 === 0 ? 'PHONE' : 'FRONT';
}
