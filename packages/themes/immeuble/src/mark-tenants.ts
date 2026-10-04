import type { ScreenHost } from '@deskorama/core';
import type { Room } from './room.ts';
import { VISIBLE_FROM } from './settle-tenants.ts';

/**
 * Writes on the root how many people are home and how many of them can be seen, for whoever observes the scene.
 * @example
 * markTenants(root, rooms, residents.litIds(), host); // data-tenants="9" data-tenants-in-view="4"
 */
export function markTenants(
  root: HTMLElement,
  rooms: readonly Room[],
  lit: ReadonlySet<string>,
  host: ScreenHost,
): void {
  const inView = rooms.filter((room) => lit.has(room.id) && host.visibleFraction(room.stage) >= VISIBLE_FROM);

  root.dataset['tenants'] = String(lit.size);
  root.dataset['tenantsInView'] = String(inView.length);
}
