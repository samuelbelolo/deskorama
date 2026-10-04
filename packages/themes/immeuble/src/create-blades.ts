import type { Cancel, GaugeValues, Rect, ScreenHost } from '@deskorama/core';
import { bladeLines, type BladeKind } from './blade-lines.ts';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { drawSignLines } from './draw-sign-lines.ts';
import { TILE } from './grid.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SignHomes } from './sign-homes.ts';
import type { SignLine } from './sign-line.ts';
import { mirrorSign } from './mirror-sign.ts';
import { signWords } from './sign-words.ts';
import { toNative } from './to-native.ts';

/** A home that shows less than this hangs its blade sign; one that shows more than {@link SHOW_ABOVE} takes it down. */
const HIDE_BELOW = 0.7;
const SHOW_ABOVE = 0.9;

/** The Gauges' fallback signs on one screen. */
export interface Blades {
  /** Hangs, moves or takes down each blade for the windows and the free blocks as they are now; true when one moved. */
  update(): boolean;
  draw(ctx: CanvasRenderingContext2D, gauges: GaugeValues): void;
  /** Mirrors each hanging blade's words with the host's latest Gauges. */
  mirror(): void;
  dispose(): void;
}

/** One blade: the home it stands in for, and where it hangs, reserved. */
interface Slot {
  readonly kind: BladeKind;
  readonly home: Rect;
  spot: Rect | null;
  release: Cancel;
  unmirror: Cancel;
}

/**
 * Returns the native frame of a blade sign hanging in a screen block: 45 pixels wide, centred, the block's height.
 * @example
 * frameOf({ x: 300, y: 240, w: 180, h: 180 }); // { x: 75, y: 60, w: 45, h: 45 }
 */
function frameOf(spot: Rect): Rect {
  const box = toNative(spot);

  return { x: box.x + Math.floor((box.w - 45) / 2), y: box.y, w: 45, h: box.h };
}

/**
 * Returns the nearest free block of the facade for a blade sign standing in for a home, tall first; null when none.
 * @example
 * placeBlade(host, homes.board); // { x: 240, y: 480, w: 180, h: 180 }
 */
function placeBlade(host: ScreenHost, home: Rect): Rect | null {
  const near = { x: home.x + home.w / 2, y: home.y };
  const within = { x: 0, y: TILE, w: host.screen.width, h: host.screen.height - 2 * TILE };

  for (const [w, h] of [
    [180, 180],
    [180, 120],
  ] as const) {
    const spot = host.freeSpot({ w, h, near, within });
    if (spot !== null) return { x: spot.x, y: spot.y, w, h };
  }

  return null;
}

/**
 * Draws a blade sign: night blue in an ink frame, and its lines.
 * @example
 * drawBlade(ctx, bladeLines(copy, gauges, 'board', frame), frame);
 */
function drawBlade(ctx: CanvasRenderingContext2D, lines: readonly SignLine[], frame: Rect): void {
  paint(ctx, frame.x, frame.y, frame.w, frame.h, PAL.ink);
  paint(ctx, frame.x + 1, frame.y + 1, frame.w - 2, frame.h - 2, PAL.night);
  drawSignLines(ctx, lines);
}

/**
 * Takes a blade down once its home shows again or a window covers it, and hangs it when its home is covered and a
 * block is free; returns true when the blade moved.
 * @example
 * rehang(host, slot);
 */
function rehang(host: ScreenHost, slot: Slot): boolean {
  const home = host.visibleFraction(slot.home);
  const lost = slot.spot !== null && host.visibleFraction(slot.spot) < 0.99;
  let changed = false;

  if (slot.spot !== null && (home > SHOW_ABOVE || lost)) {
    slot.release();
    slot.spot = null;
    changed = true;
  }

  if (slot.spot === null && home < HIDE_BELOW) {
    slot.spot = placeBlade(host, slot.home);
    if (slot.spot !== null) slot.release = host.reserve(slot.spot);
    changed = changed || slot.spot !== null;
  }

  return changed;
}

/**
 * Returns the blade signs of one screen. When a window covers the agency board or the kiosk poster, a hanging sign
 * with the same numbers appears in the nearest free block of the facade, reserved so no Gag covers it, and goes
 * once its home is back in view. A blade that found no free block tries again on every `update`, so the Gauges
 * never stay hidden behind a window.
 * @example
 * const blades = createBlades(host, homes, { copy, mirror });
 * host.onVisibility(() => blades.update());
 */
export function createBlades(
  host: ScreenHost,
  homes: SignHomes,
  words: { readonly copy: Copy; readonly mirror: Mirror },
): Blades {
  const { copy, mirror } = words;
  const slots: Slot[] = [
    { kind: 'board', home: homes.board, spot: null, release: () => {}, unmirror: () => {} },
    { kind: 'poster', home: homes.poster, spot: null, release: () => {}, unmirror: () => {} },
  ];

  const mirrorAll = (): void => {
    const gauges = host.gauges();
    for (const slot of slots) {
      slot.unmirror();
      if (slot.spot === null) continue;

      const text = signWords(bladeLines(copy, gauges, slot.kind, frameOf(slot.spot)));
      slot.unmirror = mirrorSign(mirror, `blade-${slot.kind}`, slot.spot, text);
    }
  };

  const update = (): boolean => {
    let changed = false;
    for (const slot of slots) changed = rehang(host, slot) || changed;
    if (changed) mirrorAll();

    return changed;
  };

  update();

  return {
    update,
    draw(ctx, gauges) {
      for (const slot of slots) {
        if (slot.spot !== null)
          drawBlade(ctx, bladeLines(copy, gauges, slot.kind, frameOf(slot.spot)), frameOf(slot.spot));
      }
    },
    mirror: mirrorAll,
    dispose() {
      for (const slot of slots) {
        slot.release();
        slot.unmirror();
      }
    },
  };
}
