import { createBubble } from './create-bubble.ts';
import { figureSprite } from './figure-sprite.ts';
import { fillSlot } from './fill-slot.ts';
import { GATE, gateMarkup } from './gate-markup.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { personMarkup } from './person-markup.ts';
import { pickLine } from './pick-line.ts';
import { poseSprite } from './pose-sprite.ts';
import { robotMarkup } from './robot-markup.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { stopCardMarkup } from './stop-card-markup.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4600;
const ROBOT_SCALE = 1.9;
const ROOM = { w: 400, h: 110 } as const;

/**
 * blocked: something tried to get in and was stopped. A grey intruder bot walks up to our security gate, our agent
 * holds up a card with an orange cross over the reason ("CAPTCHA", "SECRET"), the barrier stays down, and the bot
 * turns back the way it came. Key pose: the bot at the closed barrier, the card up.
 * @example
 * director.play(blockedEvent); // through gagFor(event) === playBlocked
 */
export const playBlocked: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 1600,
  room: (stage) => ({
    w: ROOM.w,
    h: ROOM.h,
    bands: ['ground'],
    near: { x: stage.layout.width * 0.7, y: stage.layout.queue.feetY },
  }),
  build({ host, text }, event, room, layer) {
    const { spot, floor } = room;
    const gateX = spot.x + 176;
    const word = tagWord(event, text.board.roles.blocked);
    const card = stopCardMarkup(word.length);
    const agentX = spot.x + spot.w - 30;

    const gate = createSprite(layer, svgMarkup(gateMarkup(text.paint.security)), 'gate');
    const agent = figureSprite(layer, personMarkup({ coat: '#6b7a89', skin: '#c48e68', hat: true }), {
      scale: 1.8,
      facingLeft: true,
      part: 'security-agent',
    });
    const sign = createSprite(layer, svgMarkup(card.markup), 'stop-card');
    fillSlot(sign, 'tag', word);
    const coming = figureSprite(layer, robotMarkup(true), { scale: ROBOT_SCALE, facingLeft: false, part: 'intruder' });
    const going = figureSprite(layer, robotMarkup(false), { scale: ROBOT_SCALE, facingLeft: true, part: 'intruder' });
    const barrier = gateX - GATE.pivot - 4;
    const head = { x: barrier - 12, y: floor - coming.height };
    const halt = createBubble(layer, pickLine(text.lines.guardStop, host.random), {
      head: { x: agentX, y: floor - agent.height },
      room: spot,
    });
    const beep = createBubble(layer, pickLine(text.lines.bot, host.random), { head, room: spot });

    return {
      captionX: gateX,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const walkIn = keyframe(elapsed, [
          [0, 0],
          [600, 1],
        ]);
        const walkOut = keyframe(elapsed, [
          [2600, 0],
          [3900, 1],
        ]);
        const turned = elapsed >= 2600;

        poseSprite(gate, { x: gateX - GATE.pivot, y: floor - GATE.h, opacity: life });
        agent.place(agentX, floor, life);
        poseSprite(sign, { x: agentX - 30 - card.width, y: floor - 78, opacity: life });
        coming.place(lerp(spot.x + 20, barrier - 12, walkIn), floor, turned ? 0 : life);
        going.place(lerp(barrier - 12, spot.x + 20, walkOut), floor, turned ? Math.min(life, 1 - walkOut * 0.6) : 0);
        halt.node.style.opacity = keyframe(elapsed, [
          [400, 0],
          [600, 1],
          [2400, 1],
          [2600, 0],
        ]).toFixed(3);
        beep.node.style.opacity = keyframe(elapsed, [
          [2600, 0],
          [2800, 1],
          [4200, 1],
          [4400, 0],
        ]).toFixed(3);
      },
    };
  },
});
