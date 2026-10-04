import { createSprite } from './create-sprite.ts';
import { markScene } from './mark-scene.ts';

/**
 * Returns a sprite of the airport's own scenes, those that outlive a Gag: the PROD flight, the failed deploy, the
 * golden jet's runway show. It is marked `data-scene` rather than `data-gag`, so it never counts as the Gag the
 * director is playing.
 * @example
 * const plane = createSceneSprite(layer, svgMarkup(caravelleMarkup(look)), 'deploy-plane');
 */
export function createSceneSprite(parent: HTMLElement, art: Element, part: string): HTMLElement {
  return markScene(createSprite(parent, art, part));
}
