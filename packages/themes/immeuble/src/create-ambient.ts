import type { Cancel, Rect, ScreenHost } from '@deskorama/core';
import { buildNextRooms } from './build-next-rooms.ts';
import { buildRooms } from './build-rooms.ts';
import { createBlades, type Blades } from './create-blades.ts';
import { createConcierge } from './create-concierge.ts';
import type { Copy } from './create-copy.ts';
import { createLights, type Lights } from './create-lights.ts';
import type { Mirror } from './create-mirror.ts';
import { createResidents, type Residents } from './create-residents.ts';
import { createStillLayer } from './create-still-layer.ts';
import { createTally } from './create-tally.ts';
import type { Renderer } from './create-renderer.ts';
import { drawSigns } from './draw-signs.ts';
import { isOpen } from './is-open.ts';
import type { Layout } from './layout.ts';
import { localHour } from './local-hour.ts';
import { housePeople } from './house-people.ts';
import { mirrorSigns } from './mirror-signs.ts';
import type { Room } from './room.ts';
import { signHomes } from './sign-homes.ts';
import { skyRow } from './sky-row.ts';

/** The permanent life of one screen: the hour, the Gauges, the tenants, the building's lights and the signs. */
export interface Ambient {
  readonly rooms: readonly Room[];
  readonly residents: Residents;
  /** The whole building's lights: the party of a big moment, the blackout of a collapse. */
  readonly lights: Lights;
  /** The homes of the permanent signs, in screen pixels: no Gag and no plaque lands there. */
  readonly signs: readonly Rect[];
  /** Makes the concierge shake her head, her hand over her eyes, until a Clock time; nobody next door. */
  facepalm(until: number): void;
  /**
   * Steps the tenants, reads today's tally again (an intruder kept out on another screen, midnight) and hangs a blade
   * that found no room yet; true when the frame needs drawing.
   */
  update(now: number): boolean;
  /**
   * Copies the still layer, redrawn first when the hour, the screens or the lit rooms changed, then the building's
   * lights, the tenants and the concierge.
   */
  drawUnder(now: number): void;
  /** Draws what no Gag may cover: the signs, and the blade signs standing in for a covered one. */
  drawOver(now: number): void;
  /** Reads today's tally again, after an Event; true when it changed. */
  refresh(): boolean;
  dispose(): void;
}

/** What the ambient life of one screen draws on and with. */
interface AmbientStage {
  readonly root: HTMLElement;
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly copy: Copy;
  readonly renderer: Renderer;
  readonly mirror: Mirror;
}

/**
 * Returns the ambient life of one screen: the building, or the next one along the street. It listens to the Gauges,
 * the windows and the screens (each houses its share of the crowd), keeps the signs' homes reserved so no Gag lands
 * on them, mirrors every sign's words for screen readers, and writes on the root how many people are home and how
 * many of them can be seen (`data-tenants`, `data-tenants-in-view`).
 * @example
 * const ambient = createAmbient({ root, host, layout, copy, renderer, mirror });
 * ambient.drawUnder(now); // then the Gags, then ambient.drawOver(now)
 */
export function createAmbient(stage: AmbientStage): Ambient {
  const { root, host, layout, copy, renderer, mirror } = stage;
  const rooms = layout.side === 'building' ? buildRooms(layout) : buildNextRooms(layout);
  const residents = createResidents(rooms, host);
  const lights = createLights(rooms);
  const still = createStillLayer(renderer, layout, rooms);
  const homes = signHomes(layout);
  const signs = homes.hall === null ? [homes.board, homes.poster] : [homes.board, homes.poster, homes.hall];
  const reserved = signs.map((home) => host.reserve(home));
  const blades = createBlades(host, homes, { copy, mirror });
  const tally = createTally(host);
  const housing = { root, rooms, residents, host };
  const concierge = createConcierge(layout, copy, host.reducedMotion);

  const hour = (): number => localHour(host.clock.now());
  const mirrorAll = (): void => mirrorSigns(mirror, copy, layout, { gauges: host.gauges(), blocked: tally.count() });
  const refresh = (): boolean => {
    if (!tally.changed()) return false;
    mirrorAll();
    return true;
  };

  const stops: Cancel[] = [...reserved, ...follow(housing, { mirrorAll, blades })];

  housePeople(housing, host.gauges().crowd);
  mirrorAll();

  return {
    rooms,
    residents,
    lights,
    signs,
    facepalm: (until) => concierge.facepalm(until),
    update(now) {
      const moved = residents.update(now, hour());
      const tallied = refresh();
      const reacting = lights.busy(now) || concierge.busy(now);
      return blades.update() || moved || tallied || reacting;
    },
    drawUnder(now) {
      const h = hour();
      const lit = residents.litIds();
      still(h, lit, skyRow(host.screen, host.screens()));
      lights.draw(renderer.ctx, lit, now, host.reducedMotion);
      residents.draw(renderer.ctx, now, h);
      concierge.draw(renderer.ctx, h, now);
    },
    drawOver() {
      const gauges = host.gauges();
      drawSigns(renderer.ctx, copy, layout, { gauges, blocked: tally.count(), kioskOpen: isOpen('kiosk', hour()) });
      blades.draw(renderer.ctx, gauges);
    },
    refresh,
    dispose() {
      for (const stop of stops) stop();
      blades.dispose();
    },
  };
}

/**
 * Follows the host for the ambient life: the Gauges house the crowd and refresh the signs, the windows settle the
 * tenants and the blades again, and new screens split the crowd anew. Returns what stops each.
 * @example
 * const stops = follow(housing, { mirrorAll, blades });
 */
function follow(
  housing: Parameters<typeof housePeople>[0],
  signs: { readonly mirrorAll: () => void; readonly blades: Blades },
): Cancel[] {
  const { host } = housing;

  return [
    host.onGauges((next) => {
      housePeople(housing, next.crowd);
      signs.mirrorAll();
      signs.blades.mirror();
    }),
    host.onVisibility(() => {
      housePeople(housing);
      signs.blades.update();
    }),
    host.onScreens(() => housePeople(housing, host.gauges().crowd)),
  ];
}
