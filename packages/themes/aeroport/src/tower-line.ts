import type { Layout } from './layout.ts';
import type { SceneLine } from './scene-speech.ts';

/** How far the tower's radio bubble may reach to the left of the screen's right edge. */
const ROOM_WIDTH = 300;

/**
 * Returns a line the tower says over the radio, between two instants of a scene: its bubble hangs under the cab,
 * against the screen's right edge, its tail pointing up to the controller.
 * @example
 * towerLine(layoutFor(host.screen), 'Bien reçu.', 0, 2600); // { line: 'Bien reçu.', head: { x: 1372, y: 394 }, ... }
 */
export function towerLine(layout: Layout, line: string, from: number, to: number): SceneLine {
  const { tower, width } = layout;
  const head = { x: tower.x + tower.w / 2, y: tower.cabBottom + 22 };
  const room = { x: width - ROOM_WIDTH, y: head.y, w: ROOM_WIDTH, h: 120 };

  return { line, head, room, from, to, radio: true, below: true };
}
