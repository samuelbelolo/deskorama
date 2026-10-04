/** The widest and tallest Caption: two-line fact and its detail. */
export const CAPTION_BOX = { w: 300, h: 128 } as const;

/**
 * The band at the top of a Gag's room where its Caption hangs: the tallest Caption plus the gap down to the
 * actors. Every Gag holds it with its own room, so the Caption always shows in visible space.
 */
export const CAPTION_ROOM = 140;

/** How long a Caption stays after its Gag ends, for a late glance. */
export const CAPTION_HOLD_MS = 2500;
