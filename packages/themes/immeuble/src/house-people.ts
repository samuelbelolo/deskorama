import type { ScreenHost } from '@deskorama/core';
import type { Residents } from './create-residents.ts';
import { crowdShare } from './crowd-share.ts';
import { markTenants } from './mark-tenants.ts';
import type { Room } from './room.ts';

/**
 * Houses this screen's share of the crowd in its building, or settles everyone again for new windows when no crowd
 * is given, then writes the counts on the root. The share of visible rooms lit follows the whole crowd, so every
 * screen looks as busy as the Source is.
 * @example
 * housePeople({ root, rooms, residents, host }, 9); // nine flats lit on one screen, an honest share of them in view
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
  const { host } = at;

  if (crowd === undefined) at.residents.rebalance();
  else
    at.residents.setCount(
      crowdShare(crowd, host.screen, host.screens()),
      crowd / Math.max(1, host.source.gauges.crowd.max),
    );

  markTenants(at.root, at.rooms, at.residents.litIds(), host);
}
