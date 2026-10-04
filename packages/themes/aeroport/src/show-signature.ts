import type { Cancel, Rect, ScreenHost } from '@deskorama/core';
import { createBigPanel } from './create-big-panel.ts';
import type { Board } from './create-board.ts';
import type { Layout } from './layout.ts';
import { panelSizes, type PanelSize } from './panel-sizes.ts';

/** The board stands in for the panel only while this much of its first row shows. */
const BOARD_SHOWS = 0.6;

/** A window that moves this close to the end brings no panel: it would barely show. */
const UPGRADE_MIN_MS = 1500;

/** What the signature line shows on. */
export interface SignatureStage {
  readonly layer: HTMLElement;
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly board: Board;
}

/**
 * Shows the failed deploy's two-line signature for `hold` ms with the best device the windows leave: the giant
 * split-flap panel in a free box clear of `cast` (the scene playing); else the board's first two rows, when the
 * board shows; else the panel in the largest visible box, over the scene if it must. While a lesser device shows,
 * or nothing does, a window that moves brings the real panel. Returns what takes it down early.
 * @example
 * const stop = showSignature(stage, ['VOL ANNULÉ', 'PISTE FERMÉE'], { cast: { x: 0, y: 600, w: 1000, h: 300 }, hold: 8000 });
 */
export function showSignature(
  stage: SignatureStage,
  lines: readonly [string, string],
  options: { readonly cast: Rect | null; readonly hold: number },
): Cancel {
  const { host, board } = stage;
  const ends = host.clock.now() + options.hold;
  let device: Cancel | null = null;
  let panel = false;

  const attempt = (): void => {
    const left = ends - host.clock.now();
    if (panel || left < UPGRADE_MIN_MS) return;

    const clear = clearPanel(stage, lines, { avoid: options.cast, hold: left });
    if (clear !== null) {
      device?.();
      device = clear;
      panel = true;
    } else if (device === null && host.visibleFraction(board.firstRow()) >= BOARD_SHOWS) {
      device = board.takeOver(lines);
    } else if (device === null) {
      device = forcedPanel(stage, lines);
    }
  };

  attempt();

  const stopListening = host.onVisibility(attempt);
  const ending = host.clock.after(options.hold, () => {
    stopListening();
    device?.();
    device = null;
  });

  return () => {
    ending();
    stopListening();
    device?.();
  };
}

/**
 * Puts the panel up in the largest free box near the upper left that keeps clear of `avoid`, held for `hold` ms;
 * returns what takes it down, or null when no size fits.
 * @example
 * clearPanel(stage, lines, { avoid: cast, hold: 8000 }); // a Cancel, or null behind the default windows
 */
function clearPanel(
  stage: SignatureStage,
  lines: readonly [string, string],
  room: { readonly avoid: Rect | null; readonly hold: number },
): Cancel | null {
  const { host, layout } = stage;
  const near = { x: layout.width * 0.3, y: layout.height * 0.3 };

  for (const size of panelSizes(lines)) {
    const ask = { w: size.w, h: size.h, near, hold: room.hold };
    const spot = host.freeSpot(room.avoid === null ? ask : { ...ask, avoid: [room.avoid] });
    if (spot === null) continue;

    const remove = createBigPanel(stage.layer, host.clock, lines, { at: spot, size, instant: host.reducedMotion });

    return () => {
      remove();
      spot.release();
    };
  }

  return null;
}

/**
 * Puts the panel up in the middle of the largest visible box, whatever plays there, at the largest size that fits
 * (the smallest when none does); returns what takes it down, or null when nothing of the screen shows.
 * @example
 * forcedPanel(stage, lines); // a Cancel when a strip of the scene shows
 */
function forcedPanel(stage: SignatureStage, lines: readonly [string, string]): Cancel | null {
  const { host, layout } = stage;
  const free = host.largestFree();
  if (free === null) return null;

  const sizes = panelSizes(lines);
  const size: PanelSize | undefined = sizes.find((each) => each.w <= free.w && each.h <= free.h) ?? sizes.at(-1);
  if (size === undefined) return null;

  const at = {
    x: Math.min(Math.max(free.x + (free.w - size.w) / 2, 0), layout.width - size.w),
    y: Math.min(Math.max(free.y + (free.h - size.h) / 2, 0), layout.height - size.h),
  };

  return createBigPanel(stage.layer, host.clock, lines, { at, size, instant: host.reducedMotion });
}
