import { keyframe } from './keyframe.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import type { Gag } from './stage.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4000;
const TILT = -9;

/** The stamp's height, and how much room its slam and tilt need around it. */
const STAMP_HEIGHT = 64;
const SLAM_FROM = 1.25;

/**
 * approval: the orange customs stamp slams the tag ("MERGÉE", "RÉSOLU") down over the Source's name, bounces once,
 * and stays. Key pose: the stamp on the paper.
 * @example
 * director.play(approvalEvent); // through gagFor(event) === playApproval
 */
export const playApproval: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 1500,
  room: (stage, event) => {
    const { layout, text } = stage;
    const box = slamBox(stampWidth(tagWord(event, text.paint.stamp).length));
    return {
      w: box.w,
      h: box.h,
      bands: [layout.skyBand, 'ground'],
      near: { x: layout.board.x + layout.board.w / 2, y: layout.board.y + layout.board.h + 120 },
    };
  },
  build({ host, text }, event, room, layer) {
    const word = tagWord(event, text.paint.stamp);
    const width = stampWidth(word.length);
    const centre = { x: room.spot.x + room.spot.w / 2, y: (room.top + room.floor) / 2 };

    const stamp = document.createElement('div');
    stamp.className = 'aeroport-stamp';
    stamp.dataset['part'] = 'stamp';
    stamp.dataset['gag'] = '';
    stamp.style.width = `${width}px`;
    stamp.style.height = `${STAMP_HEIGHT}px`;
    const big = document.createElement('span');
    big.textContent = word;
    const small = document.createElement('small');
    small.textContent = host.source.name.toUpperCase();
    stamp.append(big, small);
    layer.append(stamp);

    return {
      captionX: centre.x,
      draw(elapsed) {
        const scale = keyframe(elapsed, [
          [0, SLAM_FROM],
          [170, 0.94],
          [270, 1.04],
          [380, 1],
        ]);
        const opacity = keyframe(elapsed, [
          [0, 0],
          [95, 1],
          [DURATION - 400, 1],
          [DURATION, 0],
        ]);
        const x = centre.x - width / 2;
        const y = centre.y - STAMP_HEIGHT / 2;
        poseSprite(stamp, { x, y, rotate: TILT, scaleX: scale, scaleY: scale, opacity });
      },
    };
  },
});

/**
 * Returns the stamp's width for a word of `chars` capitals.
 * @example
 * stampWidth(6); // 170
 */
function stampWidth(chars: number): number {
  return Math.max(170, Math.round(chars * 18 + 44));
}

/**
 * Returns the room a stamp of `width` needs at its biggest: slammed from above, tilted.
 * @example
 * slamBox(170); // { w: 241, h: 125 }
 */
function slamBox(width: number): { w: number; h: number } {
  const turn = (Math.abs(TILT) * Math.PI) / 180;
  const w = (width * Math.cos(turn) + STAMP_HEIGHT * Math.sin(turn)) * SLAM_FROM;
  const h = (width * Math.sin(turn) + STAMP_HEIGHT * Math.cos(turn)) * SLAM_FROM;

  return { w: Math.ceil(w) + 8, h: Math.ceil(h) + 8 };
}
