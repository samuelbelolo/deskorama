import { createEngine, createRandom, type Cancel, type Host, type ScreenLayers } from '@deskorama/core';
import type { Choice } from './choice.ts';
import { createSimulator, type Simulator } from './simulate/create-simulator.ts';

/** A running engine with a Theme mounted on every fake screen, and the fictional Source feeding it. */
export interface Session {
  readonly simulator: Simulator;
  readonly stop: Cancel;
}

/** The seed of the demo's random generators: the same visit always looks the same. */
const DEMO_SEED = 2026;

/** Mixed into the seed of the fictional Source's draws, apart from the engine's. */
const SOURCE_SALT = 0x2f6b;

/**
 * Starts an engine in the chosen language on the chosen fictional Source, mounts the chosen Theme on every fake
 * screen, and sets the Source to work at `speed`, from whatever hour the host's Clock reads. Changing the language,
 * the Source, the Theme or the hour stops the session and starts a new one, so every word on screen comes through the
 * engine's localisation and the Gauges start from the new hour; the new engine starts afresh, without the Events of
 * the previous one.
 * @example
 * const session = startSession(host, { lang: 'fr', source: TRAMLO, theme: DEMO_THEMES[0], hour: 14 }, layers, 10);
 * session.simulator.trigger('pull_request.merged'); // L'Aéroport plays the approval Gag, captioned "Pull request mergée"
 * session.stop(); // the scene and the Source stop
 */
export function startSession(
  host: Host,
  { lang, source, theme }: Choice,
  layers: ScreenLayers<HTMLElement>,
  speed: number,
): Session {
  if (theme.create === null) throw new Error(`The Theme ${theme.id} is not ready yet.`);

  // A visitor hides the wallpaper for seconds, not hours: any return with missed Events brings the recap.
  const engine = createEngine(host, { lang, seed: DEMO_SEED, source: source.profile, recapAfter: 0 });

  // The Source reports its Gauges before the Theme mounts, so the scene opens on them rather than counting up from zero.
  const simulator = createSimulator(engine, source, {
    clock: host.clock,
    random: createRandom(DEMO_SEED ^ SOURCE_SALT),
    speed,
  });
  const unmount = engine.mountScreens(theme.create(), layers);

  return {
    simulator,
    stop() {
      simulator.stop();
      unmount();
    },
  };
}
