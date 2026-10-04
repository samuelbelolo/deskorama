import { createEngine, type Cancel, type Engine, type Host, type Language, type ScreenLayers } from '@deskorama/core';
import { createAeroport } from '@deskorama/theme-aeroport';
import { FICTIONAL_GAUGES, FICTIONAL_SOURCE } from './fictional-source.ts';

/** A running engine with L'Aéroport mounted on every fake screen. */
export interface Session {
  readonly engine: Engine;
  readonly stop: Cancel;
}

/** The seed of the demo's random generator: the same visit always looks the same. */
const DEMO_SEED = 2026;

/**
 * Starts an engine in one display language on Tramlo, sets Tramlo's Gauges as a first poll would, and mounts
 * L'Aéroport on every fake screen. Switching language stops the session and starts a new one, so every word on
 * screen comes through the engine's localisation; the new engine starts afresh, without the Events, Gauge moves or
 * missed Events of the previous one.
 * @example
 * let session = startSession(host, 'fr', screens.layers);
 * session.stop();
 * session = startSession(host, 'en', screens.layers);
 */
export function startSession(host: Host, lang: Language, layers: ScreenLayers<HTMLElement>): Session {
  // A visitor hides the wallpaper for seconds, not hours: any return with missed Events brings the recap.
  const engine = createEngine(host, { lang, seed: DEMO_SEED, source: FICTIONAL_SOURCE, recapAfter: 0 });
  engine.setGauges(FICTIONAL_GAUGES);

  return { engine, stop: engine.mountScreens(createAeroport(), layers) };
}
