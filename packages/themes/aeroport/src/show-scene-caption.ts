import type { Cancel, Point, WallpaperEvent } from '@deskorama/core';
import { CAPTION_BOX, CAPTION_ROOM } from './caption-room.ts';
import type { Stage } from './stage.ts';

/** When and where a scene's Caption shows. */
export interface SceneCaption {
  /** The Caption hangs in the visible spot closest to this point. */
  readonly near: Point;
  /** How long it shows, from when it is due. */
  readonly duration: number;
  /** How long it waits before it is due. */
  readonly delay?: number;
}

/**
 * Shows the Caption of an Event that plays outside the director (the PROD flight, the failed deploy) in the visible
 * spot closest to `near`, held while it shows so no Gag lands on it. When no spot is free, it waits for a window to
 * move until its time is up. Returns what takes the Caption down early, or cancels it while it waits, and gives its
 * spot back.
 * @example
 * const stop = showSceneCaption(stage, deployStarted, { near: { x: 300, y: 690 }, duration: 9000 });
 */
export function showSceneCaption(stage: Stage, event: WallpaperEvent, caption: SceneCaption): Cancel {
  const { host } = stage;
  const until = host.clock.now() + (caption.delay ?? 0) + caption.duration;
  let shown: Cancel | null = null;
  let stopWaiting: Cancel | null = null;

  const show = (): boolean => {
    const hold = until - host.clock.now();
    const spot = host.freeSpot({ w: CAPTION_BOX.w, h: CAPTION_ROOM, near: caption.near, hold });
    if (spot === null) return false;

    const anchor = { x: spot.x + spot.w / 2, y: spot.y + CAPTION_ROOM };
    const remove = stage.captions.show(event, anchor, until, spot);
    shown = () => {
      remove();
      spot.release();
    };

    return true;
  };

  const due = (): void => {
    if (show()) return;

    const stopListening = host.onVisibility(() => {
      if (host.clock.now() < until && show()) stopWaiting?.();
    });
    const giveUp = host.clock.after(until - host.clock.now(), () => stopWaiting?.());
    stopWaiting = () => {
      stopListening();
      giveUp();
      stopWaiting = null;
    };
  };

  const delay = caption.delay ?? 0;
  const waiting = delay > 0 ? host.clock.after(delay, due) : null;
  if (delay <= 0) due();

  return () => {
    waiting?.();
    stopWaiting?.();
    shown?.();
  };
}
