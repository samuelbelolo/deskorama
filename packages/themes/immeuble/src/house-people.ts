import type { ScreenHost } from '@deskorama/core';
import type { Residents } from './create-residents.ts';
import { markTenants } from './mark-tenants.ts';
import type { Room } from './room.ts';

/**
 * Houses the crowd in the building, or settles everyone again for new windows when no crowd is given, then writes
 * the counts on the root.
 * @example
 * housePeople({ root, rooms, residents, host }, 9); // nine flats lit, an honest share of them in view
 */
export function housePeople(
  at: {
    readonly root: HTMLElement;
    readonly rooms: readonly Room[];
    readonly residents: Residents;
    readonly host: ScreenHost;
  },
  crowd?: number,
): void {
  if (crowd === undefined) at.residents.rebalance();
  else at.residents.setCount(crowd, crowd / Math.max(1, at.host.source.gauges.crowd.max));

  markTenants(at.root, at.rooms, at.residents.litIds(), at.host);
}
