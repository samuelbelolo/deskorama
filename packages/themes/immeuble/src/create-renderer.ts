import { SCALE } from './grid.ts';
import type { Layout } from './layout.ts';
import { nativeCanvas } from './native-canvas.ts';

/** Where the building is drawn: the visible canvas, the cached still layer under the actors, and the screen shake. */
export interface Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  /** The still layer: sky, building, rooms, shops and street, redrawn only when the hour or the lit rooms change. */
  readonly base: CanvasRenderingContext2D;
  /** Copies the still layer onto the visible canvas, before the actors are drawn over it. */
  present(): void;
  /** Shakes the picture by whole native pixels until a Clock time. */
  shake(pixels: number, until: number): void;
  /** True while the picture shakes. */
  shaking(now: number): boolean;
  /** Moves the canvas for this instant's shake, or puts it back. */
  applyShake(now: number): void;
}

/** The shake's steps, a native pixel at a time. */
const QUAKE = [
  [1, 0],
  [-1, 1],
  [0, -1],
  [-1, 0],
] as const;

/**
 * Returns the renderer of one screen: a native canvas appended to `root` and shown four times bigger.
 * @example
 * const renderer = createRenderer(root, layout);
 * renderer.present();
 */
export function createRenderer(root: HTMLElement, layout: Layout): Renderer {
  const { canvas, ctx } = nativeCanvas(layout.W, layout.H);
  canvas.style.width = `${layout.W * SCALE}px`;
  canvas.style.height = `${layout.H * SCALE}px`;
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);

  const base = nativeCanvas(layout.W, layout.H);
  let quake = { until: 0, pixels: 0 };

  return {
    canvas,
    ctx,
    base: base.ctx,
    present() {
      ctx.drawImage(base.canvas, 0, 0);
    },
    shake(pixels, until) {
      quake = { until: Math.max(until, quake.until), pixels: Math.max(pixels, quake.pixels) };
    },
    shaking: (now) => now < quake.until,
    applyShake(now) {
      if (now >= quake.until) {
        if (quake.pixels > 0) canvas.style.transform = '';
        quake = { until: 0, pixels: 0 };
        return;
      }

      const [dx, dy] = QUAKE[Math.floor(now / 50) % QUAKE.length] ?? [0, 0];
      canvas.style.transform = `translate(${dx * quake.pixels * SCALE}px, ${dy * quake.pixels * SCALE}px)`;
    },
  };
}
