import type { Layout } from './layout.ts';

/** Where the crane's parts stand, in native pixels: the roof it stands on and the jib it hoists from. */
export interface SiteGeometry {
  /** The top of the zinc roof the crane and the crates stand on. */
  readonly roofTop: number;
  /** The jib's line. */
  readonly jibY: number;
}

/** How far the jib reaches left of the tower, and the site sign's width, in native pixels. */
export const JIB_LEFT = 52;
export const SIGN_W = 74;

/** The crane's whole width, jib to counter-jib, in native pixels. */
export const CRANE_SPAN = 122;

/** Where the crane parks between deploys: its tower's x. */
export const PARKED_X = 250;

/**
 * Returns the crane's geometry on a screen.
 * @example
 * siteGeometry(layoutFor(FAKE_SCREEN)); // { roofTop: 52, jibY: 9 }
 */
export function siteGeometry(layout: Layout): SiteGeometry {
  return { roofTop: layout.roofY - 8, jibY: layout.top + 9 };
}
