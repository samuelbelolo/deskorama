/** How long every Gag holds its key pose, the frame that tells the story, so a glance at the desk still reads it. */
export const KEY_HOLD_MS = 2500;

/** How long a plaque stays after its Gag ends, for a late glance. */
export const CAPTION_HOLD_MS = 2500;

/**
 * Returns how long a Gag plays from its start: its action, then its key pose held.
 * @example
 * gagSpan(2600); // 5100
 */
export function gagSpan(duration: number): number {
  return duration + KEY_HOLD_MS;
}

/**
 * Returns how long a Gag's plaque hangs from the Gag's start: the whole Gag, then the late glance.
 * @example
 * plaqueSpan(2600); // 7600
 */
export function plaqueSpan(duration: number): number {
  return gagSpan(duration) + CAPTION_HOLD_MS;
}
