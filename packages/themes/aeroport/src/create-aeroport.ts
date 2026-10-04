import type { Theme } from '@deskorama/core';
import { createAmbient } from './create-ambient.ts';
import { createCaptions } from './create-captions.ts';
import { createDirector } from './create-director.ts';
import { createFlight } from './create-flight.ts';
import { createRecap } from './create-recap.ts';
import { createSigns } from './create-signs.ts';
import { drawPoster } from './draw-poster.ts';
import { isDescribed } from './is-described.ts';
import { layoutFor } from './layout.ts';
import { STYLES } from './styles.ts';
import { textFor } from './text-for.ts';

/**
 * Returns L'Aéroport: a 1960s airline poster airport where every Event arrives as a Gag with its Caption. The screen
 * with the desktop's origin shows the terminal and runway 09; any other screen shows the airfield beyond it. Gags
 * play one at a time; a deploy's PROD flight plays at once on every screen; the recap comes on the baggage belt.
 * Mounting draws one root into the layer; unmounting removes it and stops every timer and frame it started.
 * @example
 * const unmount = createAeroport().mount(document.querySelector('#screen'), host);
 * unmount();
 */
export function createAeroport(): Theme<HTMLElement> {
  return {
    name: 'aeroport',
    mount(layer, host) {
      const layout = layoutFor(host.screen);
      const text = textFor(host.lang);

      const root = document.createElement('div');
      root.className = 'aeroport-root';
      root.dataset['theme'] = 'aeroport';
      root.lang = host.lang;
      root.style.width = `${layout.width}px`;
      root.style.height = `${layout.height}px`;

      const style = document.createElement('style');
      style.textContent = STYLES;
      const poster = drawPoster(layout, text);
      root.append(style, poster);
      layer.append(root);

      const ambient = createAmbient(root, poster, host, { layout, text });
      // One carrier per number per screen: the signs by the terminal, the Arrivals board's header on the airfield.
      const signs = layout.side === 'terminal' ? createSigns(root, host, text, layout) : null;
      const captions = createCaptions(root, host);
      const stage = { root, host, layout, text, captions };
      const director = createDirector(stage);
      const flight = createFlight({ ...stage, board: ambient.board });
      const stopRecap = createRecap(root, host, text);

      const stopListening = host.onEvent((event) => {
        ambient.note(event);
        if (isDescribed(event) && event.archetype === 'deploy') flight.play(event);
        else director.play(event);
      });

      return () => {
        stopListening();
        stopRecap();
        flight.dispose();
        director.dispose();
        captions.dispose();
        signs?.dispose();
        ambient.dispose();
        root.remove();
      };
    },
  };
}
