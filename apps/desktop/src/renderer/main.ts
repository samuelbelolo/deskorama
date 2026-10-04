// A wallpaper page: the chosen Theme on one screen, fed with the Events the main process sends through the bridge.
import '@fontsource/jost/400.css';
import '@fontsource/jost/600.css';
import '@fontsource/jost/700.css';
import '@fontsource/barlow-condensed/600.css';
import './styles.css';
import { createEngine, type Engine } from '@deskorama/core';
import { fromWireEvent } from '../shared/from-wire-event.ts';
import { readScreenSetup } from '../shared/read-screen-setup.ts';
import type { Scene } from '../shared/scene.ts';
import { createRendererHost } from './create-renderer-host.ts';
import { themeFor } from './theme-for.ts';

const setup = readScreenSetup(window.location.search);
const layer = document.querySelector<HTMLElement>('#screen');

if (layer === null) throw new Error('The wallpaper page lacks #screen.');

const host = createRendererHost(setup.screen);

/**
 * Returns the engine of one scene, in its language and named after its brand Source.
 * @example
 * const engine = sceneEngine(setup.scene);
 * engine.mount(themeFor('aeroport'), layer); // the scene draws, named after the brand Source
 */
function sceneEngine({ lang, source }: Scene): Engine {
  return createEngine(host, { lang, seed: setup.seed, source });
}

let scene = setup.scene;
let engine = sceneEngine(scene);
let unmount = engine.mount(themeFor(scene.theme), layer);

// While paused, nothing on screen may change, not even a sign: what arrives waits here until the pause ends.
let paused = false;
let held: (() => void)[] = [];

/**
 * Applies what the main process sent now, or once the pause ends.
 * @example
 * whenPlaying(() => engine.setGauges({ daily: 3 })); // at once, or on resume while paused
 */
function whenPlaying(apply: () => void): void {
  if (paused) held.push(apply);
  else apply();
}

window.wallpaper.onScene((next) => {
  const before = unmount;

  if (next.lang !== scene.lang || JSON.stringify(next.source) !== JSON.stringify(scene.source)) {
    // A new language or brand needs a new engine, and starts the day's tally over.
    before();
    engine = sceneEngine(next);
    unmount = engine.mount(themeFor(next.theme), layer);
  } else {
    // A new Theme alone mounts on the same engine before the old one leaves, so the Events kept for the recap stay.
    unmount = engine.mount(themeFor(next.theme), layer);
    before();
  }

  scene = next;
});

window.wallpaper.onPaused((next) => {
  paused = next;

  if (paused) {
    host.setPaused(true);

    return;
  }

  // What was held goes in while the screen still counts as covered, so it plays, or comes as a recap, on reveal.
  const waiting = held;

  held = [];

  for (const apply of waiting) apply();

  host.setPaused(false);
});

window.wallpaper.onGauges((values) => whenPlaying(() => engine.setGauges(values)));
window.wallpaper.onEvent((wire) => whenPlaying(() => engine.send(fromWireEvent(wire))));
