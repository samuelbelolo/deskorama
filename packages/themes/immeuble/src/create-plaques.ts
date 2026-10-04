import type { Cancel, Clock, Rect, WallpaperEvent } from '@deskorama/core';
import type { Mirror } from './create-mirror.ts';
import { drawPlaque } from './draw-plaque.ts';
import { plaqueRect } from './plaque-rect.ts';
import type { Plaque } from './plaque.ts';
import { toNative } from './to-native.ts';
import { toStage } from './to-stage.ts';

/** The plaques of one screen, drawn over the Gags and mirrored as Captions. */
export interface Plaques {
  /** Hangs a plaque until a Clock time; returns what takes it down early. */
  add(plaque: Plaque, event: WallpaperEvent, until: number): Cancel;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(): boolean;
  dispose(): void;
}

/** A plaque blinks out over its last moments, the 16-bit way. */
const BLINK_MS = 300;

/**
 * Returns the plaque board of one screen. Leaders keep off the permanent signs (`signs`, in screen pixels) and off
 * each other's plaques; a plaque blinks out at its end unless the scene holds `still`. Each plaque is mirrored as a Caption, its fact then its detail, exactly where it is drawn.
 * @example
 * const plaques = createPlaques(clock, mirror, { signs: [boardHome, posterHome], still: false });
 * plaques.add(plaque, event, clock.now() + 7500);
 */
export function createPlaques(
  clock: Clock,
  mirror: Mirror,
  look: { readonly signs: readonly Rect[]; readonly still: boolean },
): Plaques {
  const fixed = look.signs.map(toNative);
  const shown = new Map<Plaque, { until: number; stop: Cancel }>();
  let serial = 0;

  const remove = (plaque: Plaque): void => {
    shown.get(plaque)?.stop();
    shown.delete(plaque);
  };

  return {
    add(plaque, event, until) {
      serial += 1;
      const parts: [string, string][] = [];
      if (plaque.shown.sound !== null) parts.push(['caption-sound', plaque.shown.sound]);
      parts.push(['caption-fact', plaque.shown.fact]);
      if (plaque.shown.detail !== '') parts.push(['caption-detail', plaque.shown.detail]);

      const unmirror = mirror.set(`caption-${serial}`, {
        box: toStage(plaqueRect(plaque)),
        data: { part: 'caption', event: event.id },
        parts,
      });
      const timer = clock.after(until - clock.now(), () => remove(plaque));
      shown.set(plaque, {
        until,
        stop: () => {
          timer();
          unmirror();
        },
      });

      return () => {
        remove(plaque);
        plaque.spot.release();
      };
    },
    draw(ctx, now) {
      const live = Array.from(shown.entries());
      for (const [plaque, { until }] of live) {
        if (!look.still && until - now < BLINK_MS && Math.floor(now / 100) % 2 === 1) continue;
        const others = live.filter(([other]) => other !== plaque).map(([other]) => plaqueRect(other));
        drawPlaque(ctx, plaque, [...fixed, ...others]);
      }
    },
    busy: () => shown.size > 0,
    dispose() {
      for (const plaque of Array.from(shown.keys())) {
        remove(plaque);
        plaque.spot.release();
      }
    },
  };
}
