import type { Cancel, Clock } from '@deskorama/core';
import { dayPhase, type DayPhase } from './day-phase.ts';
import type { Layout } from './layout.ts';
import { localHour } from './local-hour.ts';
import { placeSky } from './place-sky.ts';
import { TINT_NAMES } from './sky-keys.ts';
import { tintsAt } from './tints-at.ts';

/** How often the sky moves on: once a minute is smooth for a sun that crosses the screen in fourteen hours. */
export const SKY_STEP_MS = 60_000;

/**
 * Follows the hour of the Clock: writes the poster's tints on the root, marks the phase of the day on it
 * (`is-night`, `is-dawn`, `is-day`, `is-dusk`), places the sun or the moon and drifts the clouds, now and then
 * once a minute, and tells `onPhase` each time. Returns what stops it.
 * @example
 * const stop = createTimeOfDay(root, poster, { clock: host.clock, layout }, (phase) => tower.setPhase(phase));
 */
export function createTimeOfDay(
  root: HTMLElement,
  poster: SVGElement,
  scene: { readonly clock: Clock; readonly layout: Layout },
  onPhase: (phase: DayPhase) => void,
): Cancel {
  const { clock, layout } = scene;
  let next: Cancel | null = null;

  const apply = (): void => {
    const hour = localHour(clock.now());
    const tints = tintsAt(hour);
    for (const name of TINT_NAMES) root.style.setProperty(`--${name}`, tints[name]);

    const phase = dayPhase(hour);
    for (const each of ['night', 'dawn', 'day', 'dusk'] as const) root.classList.toggle(`is-${each}`, each === phase);

    placeSky(poster, hour, layout.width, layout.horizon);
    onPhase(phase);
    next = clock.after(SKY_STEP_MS, apply);
  };

  apply();

  return () => next?.();
}
