import type { Cancel, Clock, Rect } from '@deskorama/core';
import { screenOfDisplay } from '../screen-of-display.ts';
import { anyWallpaperVisible } from './any-wallpaper-visible.ts';
import type { DisplayArea } from './display-area.ts';
import { sameFrames } from './same-frames.ts';
import { systemFrames } from './system-frames.ts';
import { withoutOverlays } from './without-overlays.ts';

/** How often the frames are read while some wallpaper shows: a moved window is followed within a moment. */
export const VISIBLE_EVERY_MS = 1000;

/** How often while every screen is covered: only to notice a window moving away. */
export const COVERED_EVERY_MS = 3000;

/** What the frame watch reads and where it sends the frames. */
export interface FrameWatchOptions {
  readonly clock: Clock;
  readonly displays: () => readonly DisplayArea[];
  /** The other apps' windows, or null when they could not be read. */
  readonly readWindows: () => Promise<readonly Rect[] | null>;
  /** Receives every frame covering the wallpapers whenever they change: windows, menu bars and Docks. */
  readonly onFrames: (frames: readonly Rect[]) => void;
}

/** The frame watch, which pauses while the Mac sleeps. */
export interface FrameWatch {
  pause(): void;
  resume(): void;
  /** Reads again at once, without waiting for the next turn: the displays changed. */
  refresh(): void;
  stop(): void;
}

/**
 * Reads what covers the wallpapers every second while some of it shows, every three seconds while all of it is
 * covered, and sends the frames on whenever they change. It reads the displays at every turn, so it follows a
 * screen plugged in or unplugged; `refresh` makes it do so at once.
 * @example
 * const watch = watchWindowFrames({ clock, displays: () => screen.getAllDisplays(),
 *   readWindows: () => readWindowFrames(binary),
 *   onFrames: (frames) => sendToWindows(windows, FRAMES_CHANNEL, frames) });
 * powerMonitor.on('suspend', watch.pause);
 */
export function watchWindowFrames(options: FrameWatchOptions): FrameWatch {
  const { clock } = options;

  let last: readonly Rect[] = [];
  let windows: readonly Rect[] = [];
  let timer: Cancel | undefined;
  let running = false;
  let generation = 0;

  const read = async (): Promise<void> => {
    const current = generation;
    const displays = options.displays();

    windows = (await options.readWindows()) ?? windows;

    if (current !== generation || !running) return;

    const frames = [...systemFrames(displays), ...withoutOverlays(windows, displays)];

    if (!sameFrames(frames, last)) {
      last = frames;
      options.onFrames(frames);
    }

    const visible = anyWallpaperVisible(displays.map(screenOfDisplay), frames, clock);

    timer = clock.after(visible ? VISIBLE_EVERY_MS : COVERED_EVERY_MS, () => void read());
  };

  const resume = (): void => {
    if (running) return;

    running = true;
    generation += 1;
    void read();
  };

  const pause = (): void => {
    running = false;
    generation += 1;
    timer?.();
  };

  const refresh = (): void => {
    if (!running) return;

    pause();
    resume();
  };

  resume();

  return { pause, resume, refresh, stop: pause };
}
