/**
 * Returns a sprite of a Gag: an absolutely placed box holding `art`, marked as part of the playing Gag so tests and
 * the Caption can find it, appended to `parent`. Only transform and opacity change afterwards.
 * @example
 * const van = createSprite(stage.root, svgMarkup(vanMarkup('FONDS', '€')), 'cash-van');
 * poseSprite(van, { x: 420, y: 690 });
 */
export function createSprite(parent: HTMLElement, art: Element, part: string): HTMLElement {
  const sprite = document.createElement('div');
  sprite.className = 'aeroport-sprite';
  sprite.dataset['part'] = part;
  sprite.dataset['gag'] = '';
  sprite.append(art);
  parent.append(sprite);

  return sprite;
}
