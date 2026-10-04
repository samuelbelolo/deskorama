import { EASE } from './ease.ts';
import { keyframe } from './keyframe.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import type { Gag } from './stage.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4200;

/** A pass half's height, and how far the halves fall once torn. */
const HALF_HEIGHT = 30;
const FALL = 40;

/**
 * abandon: something is given up. A boarding pass tears in two: one half says boarding, the other carries the tag
 * ("FERMÉE", "ESSAI"); the halves part, hang a moment, then drop away. Key pose: the two halves torn apart.
 * @example
 * director.play(abandonEvent); // through gagFor(event) === playAbandon
 */
export const playAbandon: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2000,
  room: (stage, event) => ({
    w: halfWidth(stage.text.paint.pass) + halfWidth(tagWord(event, stage.text.board.roles.abandon)) + 56,
    h: HALF_HEIGHT + FALL + 70,
    bands: [stage.layout.skyBand, 'ground'],
    near: { x: stage.layout.board.x + 120, y: stage.layout.board.y + stage.layout.board.h + 100 },
  }),
  build({ text }, event, room, layer) {
    const halves = [
      half(layer, text.paint.pass, true),
      half(layer, tagWord(event, text.board.roles.abandon), false),
    ] as const;
    const centre = room.spot.x + 30 + halves[0].width;
    const top = room.top + 14;

    return {
      captionX: centre,
      draw(elapsed) {
        const tear = EASE.out(
          keyframe(elapsed, [
            [800, 0],
            [1100, 1],
          ]),
        );
        const fall = EASE.in(
          keyframe(elapsed, [
            [3000, 0],
            [DURATION, 1],
          ]),
        );
        const opacity = keyframe(elapsed, [
          [0, 0],
          [200, 1],
          [3300, 1],
          [DURATION, 0],
        ]);

        halves.forEach(({ node, width }, index) => {
          const side = index === 0 ? -1 : 1;
          const x = index === 0 ? centre - width : centre;
          const shift = side * (tear * 8 + fall * 12);
          const turn = side * (tear * 6 + fall * 14);
          poseSprite(node, { x: x + shift, y: top + fall * FALL, rotate: turn, opacity });
        });
      },
    };
  },
});

/**
 * Returns the width of a pass half for a word: about 12.5 px a letter, with its padding.
 * @example
 * halfWidth('ESSAI'); // 85
 */
function halfWidth(word: string): number {
  return Math.round(word.length * 12.5 + 22);
}

/**
 * Returns one half of the boarding pass, appended to the Gag's layer: the left half in cobalt with a torn edge, the
 * right half carrying the Event's tag as plain text.
 * @example
 * half(layer, 'EMBARQUEMENT', true);
 */
function half(layer: HTMLElement, word: string, left: boolean): { node: HTMLElement; width: number } {
  const width = halfWidth(word);
  const node = document.createElement('div');
  node.className = left ? 'aeroport-pass-half aeroport-pass-half--left' : 'aeroport-pass-half';
  node.dataset['part'] = left ? 'pass-left' : 'pass-right';
  node.dataset['gag'] = '';
  node.style.width = `${width}px`;
  node.style.transformOrigin = left ? '100% 0' : '0 0';
  node.textContent = word;
  layer.append(node);

  return { node, width };
}
