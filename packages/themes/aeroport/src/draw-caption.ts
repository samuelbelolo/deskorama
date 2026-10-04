import type { WallpaperEvent } from '@deskorama/core';

/**
 * Returns the Caption of an Event: the Source in the cobalt band, then the fact in split-flap capitals, then the
 * detail. Every Event string is set as plain text, never parsed as markup.
 * @example
 * root.append(drawCaption(event)); // TRAMLO / PULL REQUEST MERGED / #418 Fixes Google sign-in
 */
export function drawCaption(event: WallpaperEvent): HTMLElement {
  const caption = document.createElement('div');
  caption.className = 'aeroport-caption';
  caption.dataset['part'] = 'caption';
  caption.append(
    part('caption-source', event.source),
    part('caption-fact', event.label),
    ...(event.meta.detail === '' ? [] : [part('caption-detail', event.meta.detail)]),
  );
  return caption;
}

/**
 * Returns one line of the Caption.
 * @example
 * part('caption-fact', 'Pull request merged');
 */
function part(name: string, content: string): HTMLElement {
  const line = document.createElement('span');
  line.className = `aeroport-${name}`;
  line.dataset['part'] = name;
  line.textContent = content;
  return line;
}
