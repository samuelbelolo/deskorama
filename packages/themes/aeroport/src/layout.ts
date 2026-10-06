import { clearHeight, type Rect, type Screen } from '@deskorama/core';
import { CAPTION_ROOM } from './caption-room.ts';
import { sideOf, type Side } from './side-of.ts';
import { SIGN_HEIGHT, STRIP_WIDTH } from './sign-size.ts';

/** Where a Gag's people stand: their feet on one line. */
interface Feet {
  readonly x: number;
  readonly feetY: number;
}

/** Where a parked plane stands: the left of its 300-unit drawing, its wheels, its size. */
interface Parked {
  readonly x: number;
  readonly wheelsY: number;
  readonly scale: number;
}

/**
 * The poster's geometry for one screen, in pixels from its top-left corner. The ground hangs from where it ends, the
 * bottom edge or the line above the Dock; on the terminal side the terminal stands on the left, the board and the
 * tower on the right; on the airfield side the fire station stands on the left and the cargo hangar under the board.
 */
export interface Layout {
  readonly side: Side;
  readonly width: number;
  readonly height: number;
  /** Where the ground ends: the bottom edge, or above the Dock, under which only grass goes on. */
  readonly groundEnd: number;
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
  /** The board: Departures on the terminal side; Arrivals, taller for the Gauges in its header, on the airfield. */
  readonly board: Rect;
  /** The airfield's fire station, where the fire truck waits in bay 1. */
  readonly station: Rect;
  /** The Caravelle parked on the stand by the terminal. */
  readonly parked: Parked;
  /** The cargo Caravelle parked in front of the cargo hangar, on the airfield. */
  readonly cargo: Parked;
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

/** The signs' distance from the left edge and from the end of the ground. */
const SIGNS_MARGIN = { left: 24, bottom: 8 } as const;

/** The Departures board, hung from the top edge by the tower. */
const DEPARTURES = { y: 34, h: 246 } as const;

/** How much taller the Arrivals board is than the Departures one: the band of Gauge numbers under its title. */
const NUMBERS_BAND = 62;

/** The tower's cab, and how far under the Departures board its top stays so that its roof clears it. */
const CAB = { h: 72, underBoard: 10 } as const;

/**
 * Returns the poster's geometry for one screen, laid out on 1440 x 900 and anchored to the edges it belongs to; the
 * ground stands above a Dock along the bottom edge.
 * @example
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }).horizon; // 650
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 }).signsHome.y; // 954
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }).board; // { x: 870, y: 34, w: 448, h: 246 }
 * layoutFor({ id: 'external', x: 1440, y: 0, width: 1600, height: 900 }).side; // "airfield"
 */
export function layoutFor(screen: Screen): Layout {
  const { width: w, height: h } = screen;
  const side = sideOf(screen);
  const groundEnd = clearHeight(screen);
  const horizon = groundEnd - 250;
  const runwayTop = groundEnd - 142;

  // Over ground lifted above a Dock on a short screen the tower would rise into the board: its shaft shortens.
  const cabTop = Math.max(horizon - 350, DEPARTURES.y + DEPARTURES.h + CAB.underBoard);

  return {
    side,
    width: w,
    height: h,
    groundEnd,
    farLine: groundEnd - 300,
    horizon,
    freightLine: groundEnd - 178,
    taxiwayTop: groundEnd - 158,
    runwayTop,
    runwayHeight: 76,
    grassTop: groundEnd - 66,
    terminal: { x: 40, y: horizon - 180, w: Math.min(760, Math.round(w * 0.53)), h: 180 },
    hangar: { x: w - 580, y: horizon - 114, w: 420, h: 114 },
    tower: { x: w - 134, w: 132, cabTop, cabBottom: cabTop + CAB.h },
    board: { x: w - 570, y: DEPARTURES.y, w: 448, h: side === 'terminal' ? DEPARTURES.h : DEPARTURES.h + NUMBERS_BAND },
    station: { x: 150, y: horizon - 118, w: 380, h: 118 },
    parked: { x: 560, wheelsY: horizon + 90, scale: 1.5 },
    cargo: { x: w - 610, wheelsY: horizon + 90, scale: 1.3 },
    queue: { x: 556, feetY: horizon + 88, spacing: 12, max: 30 },
    cart: { x: 84, feetY: horizon + 88 },
    pile: { x: 16, feetY: horizon + 90 },
    windsock: { x: w - 32, baseY: groundEnd - 4 },
    signsHome: {
      x: SIGNS_MARGIN.left,
      y: groundEnd - SIGN_HEIGHT - SIGNS_MARGIN.bottom,
      w: STRIP_WIDTH,
      h: SIGN_HEIGHT,
    },
    skyBand: { x: 0, y: 24, w, h: horizon - 24 },
    runwayBand: { x: 0, y: runwayTop - CAPTION_ROOM - 60, w, h: groundEnd - runwayTop + CAPTION_ROOM + 60 },
  };
}
