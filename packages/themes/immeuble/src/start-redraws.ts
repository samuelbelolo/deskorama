import { onFrameAtMost, type Cancel, type ScreenHost } from '@deskorama/core';
import type { Ambient } from './create-ambient.ts';
import type { Director } from './create-director.ts';
import type { Plaques } from './create-plaques.ts';
import type { Renderer } from './create-renderer.ts';
import type { Site } from './create-site.ts';
import { BUSY_FPS, IDLE_STEP_MS } from './redraw-rate.ts';

/** A scene drawn over the Gags, outside the director: the jackpot, the recap board. */
interface Overlay {
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(now: number): boolean;
}

/** What one screen draws, layer over layer. */
interface Layers {
  readonly ambient: Ambient;
  readonly site: Site;
  readonly director: Director;
  readonly overlays: readonly Overlay[];
  readonly plaques: Plaques;
  readonly renderer: Renderer;
}

/**
 * Draws the building now and then on the Clock's frames: at most {@link BUSY_FPS} times per second while something
 * moves, once more when it stops, else once a second; nothing while the screen is hidden. Returns what draws a
 * frame at once (after an Event, a Gauge or a window moved), unless the screen is hidden, and what stops the frames.
 * @example
 * const redraws = startRedraws(host, { ambient, site, director, overlays: [deploys, recap], plaques, renderer });
 * redraws.now();
 */
export function startRedraws(host: ScreenHost, layers: Layers): { readonly now: () => void; readonly stop: Cancel } {
  const { ambient, site, director, overlays, plaques, renderer } = layers;
  let drawn = Number.NEGATIVE_INFINITY;
  let wasBusy = false;

  const render = (now: number): void => {
    drawn = now;
    ambient.drawUnder(now);
    site.draw(renderer.ctx, now);
    director.draw(renderer.ctx, now);
    for (const overlay of overlays) overlay.draw(renderer.ctx, now);
    plaques.draw(renderer.ctx, now);
    ambient.drawOver(now);
    renderer.applyShake(now);
  };

  render(host.clock.now());
  const stop = onFrameAtMost(host.clock, BUSY_FPS, (now) => {
    if (host.isHidden()) return;

    const tenants = ambient.update(now);
    const rolled = site.update(now);
    const scenes = overlays.some((overlay) => overlay.busy(now));
    const busy = director.busy() || plaques.busy() || site.busy() || scenes || renderer.shaking(now);
    if (tenants || rolled || busy || wasBusy || now - drawn >= IDLE_STEP_MS) render(now);
    wasBusy = busy;
  });

  return {
    now: () => {
      if (!host.isHidden()) render(host.clock.now());
    },
    stop,
  };
}
