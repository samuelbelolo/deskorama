import type { Point, Rect } from '@deskorama/core';
import { bubbleSize } from './bubble-size.ts';

/** How far above the speaker's head the tail of the bubble ends. */
const TAIL_GAP = 10;

/** A bubble on stage and the box it takes. */
export interface Bubble {
  readonly node: HTMLElement;
  readonly box: Rect;
}

/**
 * Returns a speech bubble saying `line`, its tail on the speaker's head, kept across inside `room`. The text is
 * set as plain text: a radio bubble may carry an Event's detail. Speech bubbles are the poster's only round shape.
 * @example
 * const { node } = createBubble(stage.root, 'Bien reçu.', { head: { x: 400, y: 690 }, room, radio: true });
 */
export function createBubble(
  parent: HTMLElement,
  line: string,
  place: { readonly head: Point; readonly room: Rect; readonly radio?: boolean },
): Bubble {
  const { head, room } = place;
  const size = bubbleSize(line, Math.min(280, room.w));
  const x = Math.min(Math.max(head.x - size.w / 2, room.x), room.x + room.w - size.w);
  const y = head.y - TAIL_GAP - size.h;

  const node = document.createElement('div');
  node.className = place.radio === true ? 'aeroport-bubble aeroport-bubble--radio' : 'aeroport-bubble';
  node.dataset['part'] = 'bubble';
  node.dataset['gag'] = '';
  node.textContent = line;
  node.style.width = `${size.w}px`;
  node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  node.style.setProperty('--tail-x', `${Math.round(Math.min(Math.max(head.x - x - 6, 10), size.w - 22))}px`);
  node.style.opacity = '0';
  parent.append(node);

  return { node, box: { x, y, w: size.w, h: size.h } };
}
