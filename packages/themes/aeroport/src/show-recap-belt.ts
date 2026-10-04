import type { Cancel, Rect, Recap, ScreenHost } from '@deskorama/core';
import { drawRecapBelt } from './draw-recap-belt.ts';
import { keyframe } from './keyframe.ts';
import { recapCases } from './recap-cases.ts';
import { recapHeading } from './recap-heading.ts';
import { runTimeline } from './run-timeline.ts';
import type { Strings } from './strings.ts';

/** How far the rollers move per millisecond, and the spacing of their pattern. */
const ROLL_SPEED = 1 / 30;
const ROLLER_PITCH = 14;

/**
 * Shows a recap on the baggage belt in `rect`, reserved until the Clock reaches `until`: it fades in, its rollers run
 * under still suitcases (still too with reduced motion), and it fades out. Calls `gone` once it is down; returns what
 * takes it down early.
 * @example
 * const stop = showRecapBelt(root, host, { recap, rect, until: host.clock.now() + 7600 }, text, () => {});
 */
export function showRecapBelt(
  root: HTMLElement,
  host: ScreenHost,
  show: { readonly recap: Recap; readonly rect: Rect; readonly until: number },
  text: Strings,
  gone: () => void,
): Cancel {
  const { recap, rect } = show;
  const release = host.reserve(rect);
  const content = { heading: recapHeading(recap, text, host.lang), cases: recapCases(recap, text, host.lang) };
  const belt = drawRecapBelt(root, rect, content, { text, lang: host.lang });
  const duration = show.until - host.clock.now();

  const takeDown = (): void => {
    release();
    belt.panel.remove();
    gone();
  };

  const draw = (elapsed: number): void => {
    const shown = keyframe(elapsed, [
      [0, 0],
      [300, 1],
      [duration - 400, 1],
      [duration, 0],
    ]);
    belt.panel.style.opacity = shown.toFixed(3);
    belt.rollers.style.transform = `translateX(${(-(elapsed * ROLL_SPEED) % ROLLER_PITCH).toFixed(1)}px)`;
  };

  const stop = runTimeline(host.clock, host.reducedMotion, { duration, still: duration / 2, draw }, takeDown);

  return () => {
    stop();
    takeDown();
  };
}
