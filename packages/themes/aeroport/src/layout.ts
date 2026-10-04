import type { Rect, Screen } from '@deskorama/core';
import { CAPTION_ROOM } from './caption-room.ts';
import { SIGN_HEIGHT, STRIP_WIDTH } from './sign-size.ts';

/** Where a Gag's people stand: their feet on one line. */
interface Feet {
  readonly x: number;
  readonly feetY: number;
}

/**
 * The poster's geometry for one screen, in pixels from its top-left corner. The ground hangs from the bottom
 * edge, the terminal stands on the left, the board and the tower on the right.
 */
export interface Layout {
  readonly width: number;
  readonly height: number;
  /** The line of the far hills. */
  readonly farLine: number;
  /** Where the terminal and the tower stand: the top of the apron. */
  readonly horizon: number;
  /** The line the freight tug's wheels roll on. */
  readonly freightLine: number;
  readonly taxiwayTop: number;
  readonly runwayTop: number;
  readonly runwayHeight: number;
  /** The top of the grass verge under the runway. */
  readonly grassTop: number;
  readonly terminal: Rect;
  readonly hangar: Rect;
  readonly tower: { readonly x: number; readonly w: number; readonly cabTop: number; readonly cabBottom: number };
  readonly board: Rect;
  /** The Caravelle parked on the stand, by the left of its 300-unit drawing and its wheels. */
  readonly parked: { readonly x: number; readonly wheelsY: number; readonly scale: number };
  /** The head of the boarding queue, at the foot of the stairs; the line grows to the left. */
  readonly queue: Feet & { readonly spacing: number; readonly max: number };
  readonly cart: Feet;
  readonly pile: Feet;
  readonly windsock: { readonly x: number; readonly baseY: number };
  /** Where the strip of signs stands when nothing covers it: on the grass verge, bottom left. */
  readonly signsHome: Rect;
  /** The sky above the buildings, where airborne Gags fly first. */
  readonly skyBand: Rect;
  /** The runway and its verges, where planes land and take off first. */
  readonly runwayBand: Rect;
}

/** The signs' distance from the left and bottom edges. */
const SIGNS_MARGIN = { left: 24, bottom: 8 } as const;

/**
 * Returns the poster's geometry for one screen, laid out on 1440 x 900 and anchored to the edges it belongs to.
 * @example
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }).horizon; // 650
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }).board; // { x: 870, y: 34, w: 448, h: 246 }
 */
export function layoutFor(screen: Screen): Layout {
  const { width: w, height: h } = screen;
  const horizon = h - 250;
  const runwayTop = h - 142;

  return {
    width: w,
    height: h,
    farLine: h - 300,
    horizon,
    freightLine: h - 178,
    taxiwayTop: h - 158,
    runwayTop,
    runwayHeight: 76,
    grassTop: h - 66,
    terminal: { x: 40, y: horizon - 180, w: Math.min(760, Math.round(w * 0.53)), h: 180 },
    hangar: { x: w - 580, y: horizon - 114, w: 420, h: 114 },
    tower: { x: w - 134, w: 132, cabTop: horizon - 350, cabBottom: horizon - 278 },
    board: { x: w - 570, y: 34, w: 448, h: 246 },
    parked: { x: 560, wheelsY: horizon + 90, scale: 1.5 },
    queue: { x: 556, feetY: horizon + 88, spacing: 12, max: 30 },
    cart: { x: 84, feetY: horizon + 88 },
    pile: { x: 16, feetY: horizon + 90 },
    windsock: { x: w - 32, baseY: h - 4 },
    signsHome: {
      x: SIGNS_MARGIN.left,
      y: h - SIGN_HEIGHT - SIGNS_MARGIN.bottom,
      w: STRIP_WIDTH,
      h: SIGN_HEIGHT,
    },
    skyBand: { x: 0, y: 24, w, h: horizon - 24 },
    runwayBand: { x: 0, y: runwayTop - CAPTION_ROOM - 60, w, h: h - runwayTop + CAPTION_ROOM + 60 },
  };
}
