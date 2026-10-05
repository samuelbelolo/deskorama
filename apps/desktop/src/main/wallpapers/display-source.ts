import type { Cancel } from '@deskorama/core';
import type { DisplayArea } from '../window-frames/display-area.ts';

/** The displays of the Mac as the app reads them: what is connected now, and when that may have changed. */
export interface DisplaySource {
  /** Every connected display. */
  all(): readonly DisplayArea[];
  /** Calls `listener` whenever a display is plugged in, unplugged, moved or resized, until cancelled. */
  onChange(listener: () => void): Cancel;
}
