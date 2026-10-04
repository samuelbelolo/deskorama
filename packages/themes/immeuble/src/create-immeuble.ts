import type { Theme } from '@deskorama/core';
import { createAmbient } from './create-ambient.ts';
import { createCopy } from './create-copy.ts';
import { createDeploys } from './create-deploys.ts';
import { createDirector } from './create-director.ts';
import { createGagEnv } from './create-gag-env.ts';
import { createMirror } from './create-mirror.ts';
import { createPlaques } from './create-plaques.ts';
import { createRecapBoard } from './create-recap-board.ts';
import { createRenderer } from './create-renderer.ts';
import { createRoot } from './create-root.ts';
import { createSite } from './create-site.ts';
import { layoutFor } from './layout.ts';
import { roleOf } from './role-of.ts';
import { startRedraws } from './start-redraws.ts';

/**
 * Returns L'Immeuble: a pixel-art Paris building cut open, where the lit flats follow the crowd, the agency board and
 * the kiosk poster show the Gauges, the crane on the roof shows the build state, and every Event plays a small Gag
 * with its plaque; a big moment sets off fireworks, a failed deploy brings the site down, and a recap board counts
 * what was missed. The screen with the desktop's origin shows the building; any other screen shows the next building
 * along the same street, with its share of the crowd and the yard of the same deploys. Mounting draws one root into
 * the layer; unmounting removes it and stops every timer and frame it started.
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
      const site = createSite({ host, layout, copy, mirror });
      const plaques = createPlaques(host.clock, mirror, {
        signs: ambient.signs,
        still: host.reducedMotion,
      });
      const env = createGagEnv({ host, layout, copy, renderer, ambient });
      const director = createDirector({ env, mirror, plaques });
      const deploys = createDeploys({ env, ambient, site, plaques, mirror });
      const recap = createRecapBoard(env, mirror);
      const overlays = [deploys, recap];
      const redraws = startRedraws(host, { ambient, site, director, overlays, plaques, renderer });

      const stops = [
        host.onEvent((event) => {
          ambient.refresh();
          if (roleOf(event) === 'deploy') deploys.play(event);
          else director.play(event);
          redraws.now();
        }),
        host.onVisibility(() => {
          director.retry();
          redraws.now();
        }),
        host.onGauges(() => redraws.now()),
        host.onScreens(() => redraws.now()),
        host.onRecap(() => redraws.now()),
      ];

      return () => {
        for (const stop of stops) stop();
        redraws.stop();
        director.dispose();
        recap.dispose();
        deploys.dispose();
        plaques.dispose();
        site.dispose();
        ambient.dispose();
        mirror.clear();
        root.remove();
      };
    },
  };
}
