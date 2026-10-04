import type { Rect } from '@deskorama/core';
import { execFile } from 'node:child_process';
import * as v from 'valibot';

/**
 * The flags that keep get-windows from asking for any permission: without Screen Recording it returns every
 * window's frame but no title, which is all the app reads.
 */
const ARGUMENTS = ['--no-accessibility-permission', '--no-screen-recording-permission', '--open-windows-list'];

/** The part of each window get-windows reports that is read: its frame, in points from the main display's corner. */
const WINDOWS = v.array(
  v.object({ bounds: v.object({ x: v.number(), y: v.number(), width: v.number(), height: v.number() }) }),
);

/**
 * Runs get-windows' executable and returns the frames of the other apps' windows on the current Space, in desktop
 * coordinates. Desktop-level windows (the wallpapers, Finder's icons) are not listed. Resolves with null when the
 * listing fails, so the caller keeps the frames it had.
 * @example
 * await readWindowFrames(getWindowsBinary(app)); // [{ x: 0, y: 33, w: 1728, h: 1084 }, …]
 */
export function readWindowFrames(binary: string): Promise<Rect[] | null> {
  return new Promise((resolve) => {
    execFile(binary, ARGUMENTS, { timeout: 5000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout) => {
      if (error !== null) return resolve(null);

      try {
        const parsed = v.safeParse(WINDOWS, JSON.parse(stdout));

        if (!parsed.success) return resolve(null);

        const frames = parsed.output.map(({ bounds }) => ({
          x: bounds.x,
          y: bounds.y,
          w: bounds.width,
          h: bounds.height,
        }));

        resolve(frames.filter((frame) => frame.w > 0 && frame.h > 0));
      } catch {
        resolve(null);
      }
    });
  });
}
