import type { Cancel, Point, Rect, ScreenHost, WallpaperEvent } from '@deskorama/core';
import { CAPTION_BOX } from './caption-room.ts';
import { drawCaption } from './draw-caption.ts';

/** Shows the Captions of one screen. */
export interface Captions {
  /**
   * Shows the Caption of `event` above `anchor`, kept across inside `bounds`, until the Clock reaches `until`, and
   * returns what takes it down early. A Caption still held for a late glance stays: each one lives in its Gag's own
   * held room, so they never overlap.
   */
  show(event: WallpaperEvent, anchor: Point, until: number, bounds: Rect): Cancel;
  /** Removes every Caption and cancels their timers. */
  dispose(): void;
}

/**
 * Returns the Caption manager of one screen.
 * @example
 * const captions = createCaptions(root, host);
 * captions.show(event, { x: 534, y: 680 }, host.clock.now() + 7000, { x: 300, y: 526, w: 675, h: 140 });
 */
export function createCaptions(root: HTMLElement, host: ScreenHost): Captions {
  const shown = new Map<HTMLElement, Cancel>();

  const remove = (node: HTMLElement): void => {
    shown.get(node)?.();
    shown.delete(node);
    node.remove();
  };

  return {
    show(event, anchor, until, bounds) {
      const node = drawCaption(event);
      const left = Math.min(Math.max(anchor.x - CAPTION_BOX.w / 2, bounds.x), bounds.x + bounds.w - CAPTION_BOX.w);
      node.style.left = `${Math.round(left)}px`;
      node.style.top = `${Math.round(anchor.y - 12)}px`;
      node.style.transform = 'translateY(-100%)';
      root.append(node);

      shown.set(
        node,
        host.clock.after(until - host.clock.now(), () => remove(node)),
      );

      return () => remove(node);
    },
    dispose() {
      for (const node of Array.from(shown.keys())) remove(node);
    },
  };
}
