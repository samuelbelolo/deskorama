/** Where a sprite stands and how it shows, at one instant. */
export interface SpritePose {
  readonly x: number;
  readonly y: number;
  readonly opacity?: number;
  /** Degrees, clockwise, around the sprite's transform origin. */
  readonly rotate?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
}

/**
 * Moves a sprite to its pose: translation, then rotation and scale around its origin, and opacity.
 * @example
 * poseSprite(sprite, { x: 420, y: 690, rotate: -8, opacity: 0.5 });
 */
export function poseSprite(sprite: HTMLElement, pose: SpritePose): void {
  const turn = pose.rotate === undefined ? '' : ` rotate(${pose.rotate.toFixed(2)}deg)`;
  const scale =
    pose.scaleX === undefined && pose.scaleY === undefined
      ? ''
      : ` scale(${(pose.scaleX ?? 1).toFixed(3)}, ${(pose.scaleY ?? 1).toFixed(3)})`;

  sprite.style.transform = `translate(${pose.x.toFixed(1)}px, ${pose.y.toFixed(1)}px)${turn}${scale}`;
  sprite.style.opacity = (pose.opacity ?? 1).toFixed(3);
}
