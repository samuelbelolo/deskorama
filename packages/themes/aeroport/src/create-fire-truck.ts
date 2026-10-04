import type { Point } from '@deskorama/core';
import { createSceneSprite } from './create-scene-sprite.ts';
import { FIRE_TRUCK, fireTruckMarkup } from './fire-truck-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { svgMarkup } from './svg-markup.ts';

/** The fire truck's size on screen. */
const TRUCK_SCALE = 1.15;

/** How long each lamp of the light bar stays lit while the truck races. */
const BLINK_MS = 170;

/** Which lamps of the light bar are lit: one then the other while it races, both once it stands by. */
type TruckLights = 'blinking' | 'steady';

/** The fire truck on screen. */
export interface FireTruck {
  readonly node: HTMLElement;
  /** Places it by the left of its drawing and the line its wheels stand on, its lamps as they are at `elapsed`. */
  readonly place: (x: number, wheelsY: number, lights: TruckLights, elapsed: number) => void;
  /** Where its nozzle's tip is now. */
  readonly nozzle: () => Point;
  /** Where it stands now, by the left of its drawing. */
  readonly x: () => number;
}

/**
 * Returns the airport's fire truck facing left, or mirrored to face right, its word painted on its side.
 * @example
 * const truck = createFireTruck(layer, 'POMPIERS');
 * truck.place(900, 756, 'blinking', 400);
 */
export function createFireTruck(parent: HTMLElement, word: string, facingRight = false): FireTruck {
  const art = svgMarkup(fireTruckMarkup(word, TRUCK_SCALE));
  const node = createSceneSprite(parent, art, 'fire-truck');
  let at = { x: 0, y: 0 };

  return {
    node,
    place(x, wheelsY, lights, elapsed) {
      at = { x, y: wheelsY - FIRE_TRUCK.wheels * TRUCK_SCALE };
      // Mirrored around its left edge, so a truck facing right is placed by its right edge.
      if (facingRight) poseSprite(node, { ...at, x: x + FIRE_TRUCK.w * TRUCK_SCALE, scaleX: -1, scaleY: 1 });
      else poseSprite(node, at);

      const first = Math.floor(elapsed / BLINK_MS) % 2 === 0;
      art.dataset['lights'] = lights === 'steady' ? 'both' : first ? 'a' : 'b';
    },
    nozzle: () => ({ x: at.x + FIRE_TRUCK.nozzle.x * TRUCK_SCALE, y: at.y + FIRE_TRUCK.nozzle.y * TRUCK_SCALE }),
    x: () => at.x,
  };
}
