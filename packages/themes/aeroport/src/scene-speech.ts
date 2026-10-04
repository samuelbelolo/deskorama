import type { Point, Rect, VisibleRegions } from '@deskorama/core';
import { createBubble } from './create-bubble.ts';
import { keyframe } from './keyframe.ts';
import { markScene } from './mark-scene.ts';

/** How long a bubble takes to appear and to go. */
const FADE_MS = 150;

/** One line said during a scene, between two instants of it. */
export interface SceneLine {
  readonly line: string;
  /** Where the speaker's head is: the bubble's tail points there. */
  readonly head: Point;
  /** Where the bubble may stand. */
  readonly room: Rect;
  readonly from: number;
  readonly to: number;
  readonly radio?: boolean;
  readonly below?: boolean;
}

/** The speech of a scene: its bubbles, shown as its time passes. */
export interface SceneSpeech {
  /** Shows the lines said `elapsed` ms into the scene, fading in and out. */
  readonly draw: (elapsed: number) => void;
  readonly dispose: () => void;
}

/**
 * Returns the bubbles of a scene's lines. A line whose bubble would not be fully visible is left out rather than
 * cut by a window: the Caption already says what happened. The bubbles belong to the scene, not to a Gag.
 * @example
 * const speech = sceneSpeech(layer, host, [{ line: 'C’est le cache.', head, room, from: 1900, to: 4700 }]);
 * speech.draw(2000);
 */
export function sceneSpeech(parent: HTMLElement, regions: VisibleRegions, lines: readonly SceneLine[]): SceneSpeech {
  const shown = lines.flatMap((said) => {
    const bubble = createBubble(parent, said.line, said);
    markScene(bubble.node);

    if (regions.visibleFraction(bubble.box) === 1) return [{ said, node: bubble.node }];

    bubble.node.remove();

    return [];
  });

  return {
    draw(elapsed) {
      for (const { said, node } of shown) {
        const opacity = keyframe(elapsed, [
          [said.from, 0],
          [said.from + FADE_MS, 1],
          [said.to - FADE_MS, 1],
          [said.to, 0],
        ]);
        node.style.opacity = opacity.toFixed(3);
      }
    },
    dispose() {
      for (const { node } of shown) node.remove();
    },
  };
}
