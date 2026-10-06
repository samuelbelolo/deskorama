// A wallpaper page: the chosen Theme on one screen, playing what the main process sends through the bridge. The main
// process decides which screen plays each Event; this page decides nothing.
import '@fontsource/jost/400.css';
import '@fontsource/jost/600.css';
import '@fontsource/jost/700.css';
import '@fontsource/barlow-condensed/600.css';
import './styles.css';
import { clearHeight, createScreenPlayer, type ScreenPlayer, type SharedSnapshot } from '@deskorama/core';
import { fromWireEvent } from '../shared/from-wire-event.ts';
import { fromWireRecap } from '../shared/from-wire-recap.ts';
import { fromWireState } from '../shared/from-wire-state.ts';
import { readScreenSetup } from '../shared/read-screen-setup.ts';
import type { Scene } from '../shared/scene.ts';
import { createRendererHost } from './create-renderer-host.ts';
import { themeFor } from './theme-for.ts';

const setup = readScreenSetup(window.location.search);
const layer = document.querySelector<HTMLElement>('#screen');

if (layer === null) throw new Error('The wallpaper page lacks #screen.');

const host = createRendererHost(setup.screens);

// The page's screen as the main process last reported it: its place and size for good, its Dock as it is now.
let screen = setup.screen;

/**
 * Returns the player of one scene on this page's screen, in its language and named after its brand Source.
 * @example
 * const player = scenePlayer(setup.scene);
 * player.mount(themeFor('aeroport'), layer); // the scene draws, named after the brand Source
 */
function scenePlayer({ lang, source }: Scene): ScreenPlayer {
  return createScreenPlayer(host, { screen, lang, seed: setup.seed, source });
}

let scene = setup.scene;
let player = scenePlayer(scene);

// What every screen shares as the main process last sent it, and what unmounts the Theme once it is mounted.
let state: SharedSnapshot | null = null;
let unmount: (() => void) | null = null;

window.wallpaper.onState((wire) => {
  state = fromWireState(wire);
  player.setState(state);

  // The scene opens once the page knows what every screen shares, the first thing it is sent: a Theme reads today's
  // counts and the recent Events as it mounts, and a display plugged in later must show what its neighbours show.
  unmount ??= player.mount(themeFor(scene.theme), layer);
});

window.wallpaper.onScene((next) => {
  const startsOver = next.lang !== scene.lang || JSON.stringify(next.source) !== JSON.stringify(scene.source);
  const before = unmount;

  scene = next;

  if (state === null || before === null) {
    // Nothing is mounted yet: the scene will open on `next`.
    if (startsOver) player = scenePlayer(next);

    return;
  }

  if (startsOver) {
    // A new language or brand needs a new player, which opens on what every screen shares now.
    before();
    player = scenePlayer(next);
    player.setState(state);
    unmount = player.mount(themeFor(next.theme), layer);
  } else {
    // A new Theme alone mounts on the same player before the old one leaves, so the scene is never empty.
    unmount = player.mount(themeFor(next.theme), layer);
    before();
  }
});

host.onScreens?.((screens) => {
  const reported = screens.find((each) => each.id === screen.id);

  // Only a Dock that moves the line the ground ends on changes the scene: a display that moves gets a new window.
  if (reported === undefined || clearHeight(reported) === clearHeight(screen)) return;

  const before = unmount;

  screen = reported;
  player = scenePlayer(scene);

  if (state === null || before === null) return;

  // The scene is laid out again in this window, the new one drawn before the old one leaves: no empty frame.
  player.setState(state);
  unmount = player.mount(themeFor(scene.theme), layer);
  before();
});

window.wallpaper.onEvent((wire) => player.play(fromWireEvent(wire)));
window.wallpaper.onRecap((wire) => player.recap(fromWireRecap(wire)));
