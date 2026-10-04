import type { ShopId } from './shops.ts';

/** The opening hours of each ground-floor unit, from and to, as fractional hours. */
const HOURS: Readonly<Record<ShopId, readonly [number, number]>> = {
  agency: [9, 19.5],
  hall: [0, 24],
  loge: [7, 21],
  kiosk: [7, 20],
  bakery: [6.5, 20],
  cafe: [7, 23],
  florist: [9, 19.5],
};

/**
 * Returns true while a ground-floor unit is open, and lit.
 * @example
 * isOpen('bakery', 7.5); // true
 * isOpen('cafe', 3); // false
 */
export function isOpen(id: ShopId, hour: number): boolean {
  const [from, to] = HOURS[id];

  return hour >= from && hour < to;
}
