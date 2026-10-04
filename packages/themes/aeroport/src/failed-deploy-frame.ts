import type { Cancel, Point, Rect, WallpaperEvent } from '@deskorama/core';
import { CAPTION_HOLD_MS } from './caption-room.ts';
import type { FlightStage } from './flight.ts';
import { showSceneCaption } from './show-scene-caption.ts';
import { showSignature } from './show-signature.ts';

/** How long the signature line stays up, and how long the Caption waits for the scene to start. */
const SIGNATURE_MS = 8000;
const CAPTION_DELAY_MS = 700;

/**
 * Shows what frames a failed deploy on every screen, whatever plays there: the signature line wherever the windows
 * leave room, clear of `cast`, and the Caption near `near`, held a late glance after the scene of `show` ms ends.
 * Returns what takes both down early.
 * @example
 * const frame = failedDeployFrame(stage, deployFailed, { near: { x: 255, y: 620 }, cast, show: 10_000 });
 */
export function failedDeployFrame(
  stage: FlightStage,
  event: WallpaperEvent,
  place: { readonly near: Point; readonly cast: Rect | null; readonly show: number },
): Cancel {
  const lines = stage.text.jackpot.panel;
  const signature = showSignature({ ...stage, layer: stage.root }, lines, { cast: place.cast, hold: SIGNATURE_MS });
  const caption = showSceneCaption(stage, event, {
    near: place.near,
    delay: CAPTION_DELAY_MS,
    duration: place.show - CAPTION_DELAY_MS + CAPTION_HOLD_MS,
  });

  return () => {
    signature();
    caption();
  };
}
