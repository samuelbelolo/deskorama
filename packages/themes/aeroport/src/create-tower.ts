import { onFrameAtMost, type BuildState, type Cancel, type ScreenHost } from '@deskorama/core';
import type { DayPhase } from './day-phase.ts';
import { REDRAW_FPS } from './redraw-rate.ts';

/** The control tower's moods: the build state on its beacon and in its controller's pose. */
export interface Tower {
  readonly setBuild: (build: BuildState) => void;
  readonly setPhase: (phase: DayPhase) => void;
  readonly dispose: Cancel;
}

/** How fast the beacon's beam turns: one turn in about 3 s. */
const DEGREES_PER_MS = 1 / 9;

/**
 * Returns the tower's controller. While a deploy runs the beacon turns orange, its beam sweeps (still under
 * reduced motion) and the controller watches through binoculars; at night, with nothing running, the controller
 * sleeps on the desk. The poses are drawn in the poster; this sets which one shows.
 * @example
 * const tower = createTower(root, poster, host);
 * tower.setBuild('building');
 */
export function createTower(root: HTMLElement, poster: SVGElement, host: ScreenHost): Tower {
  const beam = poster.querySelector('[data-part="beam"]');
  const origin = beam?.getAttribute('transform') ?? '';
  let build: BuildState = 'idle';
  let phase: DayPhase = 'day';
  let spin: Cancel | null = null;

  const render = (): void => {
    root.dataset['build'] = build;
    root.dataset['pose'] = build === 'building' ? 'watch' : phase === 'night' ? 'sleep' : 'idle';

    const spinning = build === 'building' && !host.reducedMotion;
    if (spinning && spin === null) {
      spin = onFrameAtMost(host.clock, REDRAW_FPS, (now) => {
        beam?.setAttribute('transform', `${origin} rotate(${((now * DEGREES_PER_MS) % 360).toFixed(1)})`);
      });
    }
    if (!spinning && spin !== null) {
      spin();
      spin = null;
    }
  };

  render();

  return {
    setBuild(next) {
      build = next;
      render();
    },
    setPhase(next) {
      phase = next;
      render();
    },
    dispose: () => spin?.(),
  };
}
