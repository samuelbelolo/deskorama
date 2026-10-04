import { FIGURE_BOX, figureSvg } from './figure-svg.ts';
import { poseSprite } from './pose-sprite.ts';
import { createSprite } from './create-sprite.ts';
import { svgMarkup } from './svg-markup.ts';

/** A figure on stage, placed by its feet. */
export interface FigureSprite {
  readonly node: HTMLElement;
  /** Where its head is, from its feet: for speech bubbles and Captions. */
  readonly height: number;
  readonly place: (x: number, feetY: number, opacity?: number) => void;
}

/**
 * Returns a figure sprite (a passenger, a crew member, the intruder bot) whose feet are placed at a point.
 * @example
 * const guard = figureSprite(stage.root, crewMarkup('up'), { scale: 1.5, facingLeft: true, part: 'guard' });
 * guard.place(620, 742);
 */
export function figureSprite(
  parent: HTMLElement,
  inner: string,
  look: { readonly scale: number; readonly facingLeft: boolean; readonly part: string },
): FigureSprite {
  const node = createSprite(parent, svgMarkup(figureSvg(inner, look.scale, look.facingLeft)), look.part);
  const width = FIGURE_BOX.w * look.scale;
  const height = FIGURE_BOX.h * look.scale;

  return {
    node,
    height,
    place: (x, feetY, opacity = 1) => poseSprite(node, { x: x - width / 2, y: feetY - height, opacity }),
  };
}
