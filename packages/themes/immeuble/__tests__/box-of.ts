import type { Rect } from '@deskorama/core';

/**
 * Returns where a part of the scene is drawn, found by selector or given, in screen pixels from the top-left of the
 * building's root; null when it is not drawn.
 * @example
 * boxOf(layer, '[data-part="caption"]'); // { x: 380, y: 560, w: 300, h: 44 }
 */
export function boxOf(layer: HTMLElement, part: string | Element): Rect | null {
  const root = layer.querySelector('[data-theme="immeuble"]');
  const node = typeof part === 'string' ? layer.querySelector(part) : part;
  if (root === null || node === null) return null;

  const origin = root.getBoundingClientRect();
  const box = node.getBoundingClientRect();

  return { x: box.left - origin.left, y: box.top - origin.top, w: box.width, h: box.height };
}
