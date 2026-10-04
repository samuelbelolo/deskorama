/** The ground floor, left to right, by first column and width in bays. */
export const SHOPS = [
  { id: 'agency', col: 0, cols: 6 },
  { id: 'hall', col: 6, cols: 3 },
  { id: 'loge', col: 9, cols: 3 },
  { id: 'kiosk', col: 12, cols: 3 },
  { id: 'bakery', col: 15, cols: 3 },
  { id: 'cafe', col: 18, cols: 3 },
  { id: 'florist', col: 21, cols: 3 },
] as const;

/** The name of a ground-floor unit. */
export type ShopId = (typeof SHOPS)[number]['id'];
