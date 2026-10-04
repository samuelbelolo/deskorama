import { onFrameAtMost, type Cancel, type Clock } from '@deskorama/core';
import { REDRAW_FPS } from './redraw-rate.ts';

/** A stretch of a scene, written as a pure function of time. */
export interface Timeline {
  readonly duration: number;
  /** Poses every actor `elapsed` ms in, so any instant can be drawn alone. */
  readonly draw: (elapsed: number) => void;
  /** With reduced motion, the instant held still from start to end; its last instant when left out. */
  readonly still?: number;
}

/**
 * Plays a timeline from the Clock's display frames, at most {@link REDRAW_FPS} times per second, or holds its
 * still instant with reduced motion; when it ends, draws its last instant and calls `done`. Returns what stops it
 * early, without calling `done`.
 * @example
 * const stop = runTimeline(host.clock, host.reducedMotion, { duration: 3000, draw: (t) => taxi(t) }, () => hold());
 */
export function runTimeline(clock: Clock, reducedMotion: boolean, timeline: Timeline, done?: () => void): Cancel {
  const { duration, draw } = timeline;
  const start = clock.now();
  let frames: Cancel | null = null;

  if (reducedMotion) draw(timeline.still ?? duration);
  else {
    draw(0);
    frames = onFrameAtMost(clock, REDRAW_FPS, (now) => draw(Math.min(duration, now - start)));
  }

  const ending = clock.after(duration, () => {
    frames?.();
    draw(duration);
    done?.();
  });

  return () => {
    frames?.();
    ending();
  };
}
