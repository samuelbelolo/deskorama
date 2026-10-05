import type { WallpaperEvent } from '@deskorama/core';

/**
 * An Event as it crosses from the main process to a wallpaper page: the same fields, in the display language, with
 * its time as milliseconds since the epoch, because a `Date` does not survive the context bridge.
 */
export type WireEvent = Omit<WallpaperEvent, 'at'> & { readonly at: number };
