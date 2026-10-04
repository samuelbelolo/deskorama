import type { ScreenHost } from '@deskorama/core';
import { homeX } from './home-x.ts';
import type { Room } from './room.ts';
import type { Tenant } from './tenant.ts';

/** A room counts as in view from this visible share on. */
export const VISIBLE_FROM = 0.3;

/**
 * Lights `count` rooms: `density` of the visible ones (at least one when anyone is home), the rest in hidden rooms.
 * Rooms already lit stay lit while they still fit, so the building never reshuffles. Returns true when the set of
 * lit rooms changed.
 * @example
 * settleTenants(tenants, { host, rooms, count: 9, density: 9 / 14, nextLook }); // most visible flats lit
 */
export function settleTenants(
  tenants: Map<string, Tenant>,
  context: {
    readonly host: ScreenHost;
    readonly rooms: readonly Room[];
    readonly count: number;
    readonly density: number;
    readonly nextLook: () => number;
  },
): boolean {
  const { host, rooms } = context;
  const total = Math.max(0, Math.min(rooms.length, Math.round(context.count)));
  const scored = rooms.map((room) => ({ room, score: host.visibleFraction(room.stage) }));
  const visible = scored
    .filter((s) => s.score >= VISIBLE_FROM)
    .toSorted((a, b) => b.score - a.score || scatter(a.room) - scatter(b.room));
  const hidden = scored.filter((s) => s.score < VISIBLE_FROM).toSorted((a, b) => a.score - b.score);

  let inView = total === 0 ? 0 : Math.max(1, Math.round(context.density * visible.length));
  inView = Math.min(inView, total, visible.length);
  const behind = Math.min(total - inView, hidden.length);
  inView = Math.min(visible.length, total - behind);

  const make = (room: Room): Tenant => {
    const x = homeX(host, room);
    return {
      room,
      x,
      targetX: x,
      dir: 1,
      frame: 0,
      pose: 'FRONT',
      nextAt: 0,
      cheerUntil: 0,
      alarmUntil: 0,
      look: context.nextLook(),
    };
  };

  const a = adjust(
    tenants,
    visible.map((s) => s.room),
    inView,
    make,
  );
  const b = adjust(
    tenants,
    hidden.map((s) => s.room),
    behind,
    make,
  );

  return a || b;
}

/**
 * Returns a fixed scatter for a room, so equally visible rooms light in a mixed order rather than floor by floor.
 * @example
 * scatter(rooms[0]); // 39
 */
function scatter(room: Room): number {
  return (room.col * 37 + room.row * 101) % 97;
}

/**
 * Makes exactly `k` rooms of a pool lit, keeping those already lit and adding from the front of the pool.
 * @example
 * adjust(tenants, visibleRooms, 2, make); // true when someone moved in or out
 */
function adjust(tenants: Map<string, Tenant>, pool: readonly Room[], k: number, make: (room: Room) => Tenant): boolean {
  let changed = false;
  const lit = pool.filter((room) => tenants.has(room.id));

  for (const room of lit.slice(k)) {
    tenants.delete(room.id);
    changed = true;
  }

  let count = Math.min(lit.length, k);
  for (const room of pool) {
    if (count >= k) break;
    if (tenants.has(room.id)) continue;
    tenants.set(room.id, make(room));
    count += 1;
    changed = true;
  }

  return changed;
}
