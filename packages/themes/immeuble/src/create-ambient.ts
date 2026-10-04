import type { Cancel, Rect, ScreenHost } from '@deskorama/core';
import { buildRooms } from './build-rooms.ts';
import { createBlades } from './create-blades.ts';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { createResidents, type Residents } from './create-residents.ts';
import { createStillLayer } from './create-still-layer.ts';
import { createTally } from './create-tally.ts';
import type { Renderer } from './create-renderer.ts';
import { drawConcierge } from './draw-concierge.ts';
import { drawSigns } from './draw-signs.ts';
import { isOpen } from './is-open.ts';
import type { Layout } from './layout.ts';
import { localHour } from './local-hour.ts';
import { housePeople } from './house-people.ts';
import { mirrorSigns } from './mirror-signs.ts';
import type { Room } from './room.ts';
import { signHomes } from './sign-homes.ts';

/** The permanent life of one screen: the hour, the Gauges, the tenants and the ground floor's signs. */
export interface Ambient {
  readonly rooms: readonly Room[];
  readonly residents: Residents;
  /** The homes of the permanent signs on the ground floor, in screen pixels: no Gag and no plaque lands there. */
  readonly signs: readonly Rect[];
  /**
   * Steps the tenants, reads today's tally again (an intruder kept out on another screen, midnight) and hangs a blade
   * that found no room yet; true when the frame needs drawing.
   */
  update(now: number): boolean;
  /** Copies the still layer, redrawn first when the hour or the lit rooms changed, then the tenants and the concierge. */
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
 * Returns the ambient life of one screen. It listens to the Gauges and the windows, keeps the signs' homes
 * reserved so no Gag lands on them, mirrors every sign's words for screen readers, and writes on the root how many
 * people are home and how many of them can be seen (`data-tenants`, `data-tenants-in-view`).
 * @example
 * const ambient = createAmbient({ root, host, layout, copy, renderer, mirror });
 * ambient.drawUnder(now); // then the Gags, then ambient.drawOver(now)
 */
export function createAmbient(stage: AmbientStage): Ambient {
  const { root, host, layout, copy, renderer, mirror } = stage;
  const rooms = buildRooms(layout);
  const residents = createResidents(rooms, host);
  const still = createStillLayer(renderer, layout, rooms);
  const homes = signHomes(layout);
  const signs = [homes.board, homes.poster, homes.hall];
  const reserved = signs.map((home) => host.reserve(home));
  const blades = createBlades(host, homes, { copy, mirror });
  const tally = createTally(host);
  const housing = { root, rooms, residents, host };

  const hour = (): number => localHour(host.clock.now());
  const mirrorAll = (): void => mirrorSigns(mirror, copy, layout, { gauges: host.gauges(), blocked: tally.count() });
  const refresh = (): boolean => {
    if (!tally.changed()) return false;
    mirrorAll();
    return true;
  };

  const stops: Cancel[] = [
    ...reserved,
    host.onGauges((next) => {
      housePeople(housing, next.crowd);
      mirrorAll();
      blades.mirror();
    }),
    host.onVisibility(() => {
      housePeople(housing);
      blades.update();
    }),
  ];

  housePeople(housing, host.gauges().crowd);
  mirrorAll();

  return {
    rooms,
    residents,
    signs,
    update(now) {
      const moved = residents.update(now, hour());
      const tallied = refresh();
      return blades.update() || moved || tallied;
    },
    drawUnder(now) {
      const h = hour();
      still(h, residents.litIds());
      residents.draw(renderer.ctx, now, h);
      drawConcierge(renderer.ctx, layout, h);
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
