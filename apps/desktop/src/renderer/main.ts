// A wallpaper page: L'Aéroport on one screen, fed with the Events the main process sends through the bridge.
import '@fontsource/jost/400.css';
import '@fontsource/jost/600.css';
import '@fontsource/jost/700.css';
import '@fontsource/barlow-condensed/600.css';
import './styles.css';
import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import { createEngine } from '@deskorama/core';
import { createAeroport } from '@deskorama/theme-aeroport';
import { fromWireEvent } from '../shared/from-wire-event.ts';
import { readScreenSetup } from '../shared/read-screen-setup.ts';
import { createRendererHost } from './create-renderer-host.ts';

const setup = readScreenSetup(window.location.search);
const layer = document.querySelector<HTMLElement>('#screen');

if (layer === null) throw new Error('The wallpaper page lacks #screen.');

const engine = createEngine(createRendererHost(setup.screen), {
  lang: setup.lang,
  seed: setup.seed,
  source: LOCAL_WEBHOOK_PROFILE,
});

engine.mount(createAeroport(), layer);

window.wallpaper.onEvent((wire) => engine.send(fromWireEvent(wire)));
