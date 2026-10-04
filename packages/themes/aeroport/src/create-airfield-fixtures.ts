import type { ScreenHost } from '@deskorama/core';
import { CARAVELLE, caravelleMarkup } from './caravelle-markup.ts';
import type { Layout } from './layout.ts';
import type { SideFixtures } from './side-fixtures.ts';
import type { Strings } from './strings.ts';
import { svgMarkup } from './svg-markup.ts';

/**
 * Returns what stands on the airfield side: the cargo Caravelle parked in front of the cargo hangar, its cargo door
 * open on the apron. It is reserved so no Gag lands on it; nothing on this side follows the crowd or the hour.
 * @example
 * const fixtures = createAirfieldFixtures(root, host, { layout, text });
 * fixtures.dispose();
 */
export function createAirfieldFixtures(
  root: HTMLElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly text: Strings },
): SideFixtures {
  const { x, wheelsY, scale } = scene.layout.cargo;
  const top = wheelsY - CARAVELLE.wheels * scale;

  const plane = document.createElement('div');
  plane.className = 'aeroport-fixture';
  plane.dataset['part'] = 'cargo-plane';
  plane.style.transform = `translate(${x}px, ${top}px)`;
  plane.append(
    svgMarkup(
      caravelleMarkup({ title: scene.text.paint.cargoAirline, scale, facing: 'left', cargo: true, parked: true }),
    ),
  );
  root.append(plane);

  const release = host.reserve({ x, y: top, w: CARAVELLE.w * scale, h: wheelsY - top + 6 });

  return {
    setPhase: () => {},
    show: () => {},
    note: () => {},
    newDay: () => {},
    dispose() {
      release();
      plane.remove();
    },
  };
}
