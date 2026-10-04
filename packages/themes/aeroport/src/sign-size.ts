/** One airfield sign, in pixels. Fixed, so the strip's room is known before anything is laid out. */
export const SIGN_WIDTH = 104;
export const SIGN_HEIGHT = 58;
export const SIGN_GAP = 6;

/** How many signs stand in the strip: the three Gauges and the deploy. */
const SIGN_COUNT = 4;

/** The whole strip of signs. */
export const STRIP_WIDTH: number = SIGN_COUNT * SIGN_WIDTH + (SIGN_COUNT - 1) * SIGN_GAP;
