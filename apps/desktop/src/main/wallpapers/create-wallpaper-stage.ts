import { createEngine, type Cancel, type Engine, type GaugeValues, type Host, type SourceEvent } from '@deskorama/core';
import type { Scene } from '../../shared/scene.ts';
import type { ScreenSetup } from '../../shared/screen-setup.ts';
import { toWireState } from '../../shared/to-wire-state.ts';
import { FRAMES_CHANNEL, SCENE_CHANNEL, STATE_CHANNEL } from '../../shared/wallpaper-bridge.ts';
import { createHold } from './create-hold.ts';
import { createPausableHost } from './create-pausable-host.ts';
import { createWallpaperWindows } from './create-wallpaper-windows.ts';
import { relayTheme } from './relay-theme.ts';
import type { WallpaperPort } from './wallpaper-port.ts';

/** What the wallpapers are made of. */
export interface WallpaperStageOptions {
  /** The displays, the Clock and what covers the wallpapers. */
  readonly host: Host;
  /** The scene the wallpapers open on. */
  readonly scene: Scene;
  /** Opens the wallpaper window of one screen. */
  readonly open: (setup: ScreenSetup) => WallpaperPort;
  /** Draws a seed from the system: one for the engine, which picks each Event's screen, and one per window. */
  readonly seed: () => number;
}

/** The wallpapers of every display, as the rest of the main process drives them. */
export interface WallpaperStage {
  /** Plays an Event on the one screen the engine picks, or on every screen for a deploy. */
  send(event: SourceEvent): void;
  /** Sets the Gauge values every screen shows; roles left out keep their value. */
  setGauges(values: Partial<GaugeValues>): void;
  /** Redraws every wallpaper on a new scene. */
  setScene(scene: Scene): void;
  /** Freezes every wallpaper, or lets it play again what it missed. */
  setPaused(paused: boolean): void;
  /** Closes every wallpaper window and lets go of the host. */
  stop(): void;
}

/** One engine and what stops it. */
interface Run {
  readonly engine: Engine;
  readonly stop: Cancel;
}

/**
 * Returns the wallpapers: one window per screen, kept in step with the displays, and the one engine that decides
 * for them all. The engine runs here, in the main process, on a Theme that passes what each screen is handed on to
 * its window: an Event goes to one window drawn by visible area, a deploy to all, the recap to the most visible,
 * and every page hears the same Gauges, tally and recent Events, a page that opens later included. A display that
 * leaves loses its window, one that arrives gets one, one that moves or changes size gets a fresh one at its new
 * bounds; one whose Dock moves keeps its window, whose page lays the scene out again. While paused, every screen counts as covered and what arrives waits.
 * @example
 * const stage = createWallpaperStage({ host, scene: scene.scene(), seed,
 *   open: (setup) => openWallpaperWindow(setup, host) });
 * stage.send(mergedPullRequest); // the page of one window plays the Gag
 * stage.setPaused(true); // every scene freezes
 */
export function createWallpaperStage(options: WallpaperStageOptions): WallpaperStage {
  const host = createPausableHost(options.host);
  const held = createHold();

  let scene = options.scene;

  const windows = createWallpaperWindows((screen) =>
    options.open({ screen, screens: host.screens(), scene, seed: options.seed() }),
  );

  /** Starts an engine in the scene's language and mounts it on every screen. */
  const start = (): Run => {
    // It only routes and counts here: the pages word the scene after its Source themselves.
    const engine = createEngine(host, { lang: scene.lang, seed: options.seed(), source: scene.source });

    // Each window starts from what every screen shares and from what covers the wallpapers now.
    const layers = windows.layers((port) => {
      port.send(STATE_CHANNEL, toWireState(engine.state()));
      port.send(FRAMES_CHANNEL, host.windowFrames());
    });

    const stops = [
      engine.onState((state) => windows.broadcast(STATE_CHANNEL, toWireState(state))),
      engine.mountScreens(relayTheme(), layers),
    ];

    return {
      engine,
      stop() {
        for (const stop of stops) stop();
      },
    };
  };

  // The pages hear of new frames before anything the engine decides from them.
  const stopFrames = host.onWindowFrames((frames) => windows.broadcast(FRAMES_CHANNEL, frames));

  let run = start();
  let paused = false;

  return {
    send: (event) => held.whenFree(() => run.engine.send(event)),

    setGauges: (values) => held.whenFree(() => run.engine.setGauges(values)),

    setScene(next) {
      const newLanguage = next.lang !== scene.lang;

      scene = next;

      // The engine words every Event: a new language needs a new one, which starts the day's tally over. It takes
      // over the open windows, whose pages hear its empty state before the scene that makes them start over.
      if (newLanguage) windows.handOver(run.stop, () => void (run = start()));

      windows.broadcast(SCENE_CHANNEL, next);
    },

    setPaused(next) {
      if (next === paused) return;

      paused = next;

      if (paused) {
        held.hold();
        host.setPaused(true);

        return;
      }

      // What was held goes in while every screen still counts as covered, so it plays, or comes as a recap, on reveal.
      held.release();
      host.setPaused(false);
    },

    stop() {
      run.stop();
      stopFrames();
    },
  };
}
