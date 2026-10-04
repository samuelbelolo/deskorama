import type { Layout } from './layout.ts';

/**
 * Returns the apron with its painted taxi line, the taxiway, runway 09 with its edge paint, centreline, threshold
 * and number, the grass verge with its tufts, and the edge lights that glow at night and turn orange when the
 * runway is closed.
 * @example
 * groundMarkup(layoutFor(host.screen)).includes('runway-number'); // true
 */
export function groundMarkup(layout: Layout): string {
  const { width: w, height: h, horizon, taxiwayTop, runwayTop, runwayHeight, grassTop } = layout;
  const centre = runwayTop + runwayHeight / 2 + 1;
  const numberY = runwayTop + 56;

  let centreline = '';
  for (let x = 190; x < w; x += 78) {
    centreline += `<rect class="chalk-paint" x="${x}" y="${centre - 1.5}" width="44" height="3"/>`;
  }

  let threshold = '';
  for (let i = 0; i < 8; i += 1) {
    threshold += `<rect class="chalk-paint" x="${18 + i * 8}" y="${runwayTop + 10}" width="4" height="56"/>`;
  }

  let tufts = '';
  for (let x = 30; x < w; x += 97) {
    tufts += `<path class="tuft" d="M${x},${grassTop + 22 + ((x * 7) % 36)} l3,-7 l2,7 l3,-9 l2,9"/>`;
  }

  return `<rect class="t-apron" x="0" y="${horizon}" width="${w}" height="${taxiwayTop - horizon}"/>
    <path class="apron-paint" d="M150,${horizon + 48} H560 C600,${horizon + 48} 610,${horizon + 60} 640,${horizon + 60} H${Math.min(1040, w)}"/>
    <rect class="t-tarmac" x="0" y="${taxiwayTop}" width="${w}" height="16"/>
    <rect class="t-tarmac" x="0" y="${runwayTop}" width="${w}" height="${runwayHeight}"/>
    <rect class="chalk-paint" x="0" y="${runwayTop + 3}" width="${w}" height="2"/>
    <rect class="chalk-paint" x="0" y="${runwayTop + runwayHeight - 5}" width="${w}" height="2"/>
    ${centreline}
    ${threshold}
    <text class="runway-number" x="96" y="${numberY}" transform="translate(0 ${numberY}) scale(1 0.62) translate(0 ${-numberY})">09</text>
    <rect class="t-grass" x="0" y="${grassTop}" width="${w}" height="${h - grassTop}"/>
    ${tufts}
    ${edgeLights(runwayTop - 1, 2.2, w)}
    ${edgeLights(grassTop + 2, 3.2, w)}`;
}

/**
 * Returns a row of runway edge lights, each with its halo.
 * @example
 * edgeLights(757, 2.2, 1440).startsWith('<circle'); // true
 */
function edgeLights(y: number, r: number, width: number): string {
  let lights = '';
  for (let x = 12; x < width; x += 64) {
    lights += `<circle class="light-halo" cx="${x}" cy="${y}" r="${r * 3}"/><circle class="light" cx="${x}" cy="${y}" r="${r}"/>`;
  }

  return lights;
}
