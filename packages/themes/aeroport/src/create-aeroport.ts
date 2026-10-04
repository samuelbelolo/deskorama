import type { Theme } from '@deskorama/core';
import { createAmbient } from './create-ambient.ts';
import { createCaptions } from './create-captions.ts';
import { createDirector } from './create-director.ts';
import { createSigns } from './create-signs.ts';
import { drawPoster } from './draw-poster.ts';
import { layoutFor } from './layout.ts';
import { STYLES } from './styles.ts';
import { textFor } from './text-for.ts';

/**
 * Returns L'Aéroport: a 1960s airline poster airport where every Event arrives as a Gag with its Caption.
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
      const signs = createSigns(root, host, text, layout);
      const captions = createCaptions(root, host);
      const director = createDirector({ root, host, layout, text, captions });
      const stopListening = host.onEvent((event) => {
        ambient.note(event);
        director.play(event);
      });

      return () => {
        stopListening();
        director.dispose();
        captions.dispose();
        signs.dispose();
        ambient.dispose();
        root.remove();
      };
    },
  };
}
