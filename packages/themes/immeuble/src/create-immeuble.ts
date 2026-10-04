import type { Theme } from '@deskorama/core';
import { createAmbient } from './create-ambient.ts';
import { createCopy } from './create-copy.ts';
import { createCrane } from './create-crane.ts';
import { createDirector } from './create-director.ts';
import { createGagEnv } from './create-gag-env.ts';
import { createMirror } from './create-mirror.ts';
import { createPlaques } from './create-plaques.ts';
import { createRenderer } from './create-renderer.ts';
import { createRoot } from './create-root.ts';
import { layoutFor } from './layout.ts';
import { startRedraws } from './start-redraws.ts';

/**
 * Returns L'Immeuble: a pixel-art Paris building cut open, where the lit flats follow the crowd, the agency board and
 * the kiosk poster show the Gauges, the crane on the roof shows the build state, and every Event plays a small Gag
 * with its plaque. Mounting draws one root into the layer; unmounting removes it and stops every timer and frame
 * it started.
 * @example
 * const unmount = createImmeuble().mount(document.querySelector('#screen'), host);
 * unmount();
 */
export function createImmeuble(): Theme<HTMLElement> {
  return {
    name: 'immeuble',
    mount(layer, host) {
      const layout = layoutFor(host.screen);
      const copy = createCopy(host);
      const root = createRoot(layer, layout, { lang: host.lang, description: copy.text.description });

      const renderer = createRenderer(root, layout);
      const mirror = createMirror(root);
      const ambient = createAmbient({ root, host, layout, copy, renderer, mirror });
      const crane = createCrane({ host, layout, copy, mirror });
      const plaques = createPlaques(host.clock, mirror, {
        signs: ambient.signs,
        still: host.reducedMotion,
      });
      const env = createGagEnv({ host, layout, copy, renderer, ambient });
      const director = createDirector({ env, mirror, plaques });
      const redraws = startRedraws(host, { ambient, crane, director, plaques, renderer });

      const stops = [
        host.onEvent((event) => {
          ambient.refresh();
          director.play(event);
          redraws.now();
        }),
        host.onVisibility(() => {
          director.retry();
          redraws.now();
        }),
        host.onGauges(() => redraws.now()),
      ];

      return () => {
        for (const stop of stops) stop();
        redraws.stop();
        director.dispose();
        plaques.dispose();
        crane.dispose();
        ambient.dispose();
        mirror.clear();
        root.remove();
      };
    },
  };
}
