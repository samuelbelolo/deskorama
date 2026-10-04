import { bubbleSize } from './bubble-size.ts';
import { createBubble } from './create-bubble.ts';
import { crewMarkup } from './crew-markup.ts';
import { figureSprite } from './figure-sprite.ts';
import { keyframe } from './keyframe.ts';
import { lifeOpacity } from './life-opacity.ts';
import { personMarkup } from './person-markup.ts';
import { scriptedGag } from './scripted-gag.ts';
import type { Gag } from './stage.ts';

const DURATION = 5200;
const SCALE = 1.7;

/** The widest a radio bubble gets, and the room it needs. */
const BUBBLE_WIDTH = 280;
const ROOM_WIDTH = 380;

/** The longest message the radio carries, about four lines of its bubble. */
const SPOKEN_CHARS = 120;

/**
 * message: a message comes in. A pilot on the apron speaks it into a handheld radio, in a radio bubble that carries
 * the message itself (the detail, else the label), and the ground answers "Bien reçu.". Key pose: the message in
 * its bubble.
 * @example
 * director.play(messageEvent); // through gagFor(event) === playMessage
 */
export const playMessage: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2200,
  room: (stage, event) => ({
    w: ROOM_WIDTH,
    h: bubbleSize(spoken(event.meta.detail, event.label), BUBBLE_WIDTH).h + 12 + 30 * SCALE,
    bands: ['ground'],
    near: { x: stage.layout.parked.x + 120, y: stage.layout.queue.feetY },
  }),
  build({ text }, event, room, layer) {
    const { spot, floor } = room;
    const pilotX = spot.x + 70;
    const crewX = spot.x + spot.w - 50;

    const look = { coat: 'var(--cobalt)', skin: '#e8c3a4', hat: true, bag: 'radio' as const };
    const pilot = figureSprite(layer, personMarkup(look), { scale: SCALE, facingLeft: false, part: 'pilot' });
    const crew = figureSprite(layer, crewMarkup('out'), { scale: SCALE, facingLeft: true, part: 'ground-crew' });
    const head = (x: number): { x: number; y: number } => ({ x, y: floor - pilot.height });
    const message = createBubble(layer, spoken(event.meta.detail, event.label), {
      head: head(pilotX),
      room: spot,
      radio: true,
    });
    const roger = createBubble(layer, text.lines.roger, { head: head(crewX), room: spot, radio: true });

    return {
      captionX: spot.x + spot.w / 2,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        pilot.place(pilotX, floor, life);
        crew.place(crewX, floor, life);
        message.node.style.opacity = keyframe(elapsed, [
          [200, 0],
          [400, 1],
          [3300, 1],
          [3500, 0],
        ]).toFixed(3);
        roger.node.style.opacity = keyframe(elapsed, [
          [3500, 0],
          [3700, 1],
          [4800, 1],
          [5000, 0],
        ]).toFixed(3);
      },
    };
  },
});

/**
 * Returns what comes over the radio: the Event's detail, else its label, cut with an ellipsis past four lines.
 * @example
 * spoken('« Le bouton Exporter ne répond plus »', 'Issue ouverte'); // "« Le bouton Exporter ne répond plus »"
 * spoken('', 'Issue ouverte'); // "Issue ouverte"
 */
function spoken(detail: string, label: string): string {
  const line = detail.trim() === '' ? label : detail;

  return line.length > SPOKEN_CHARS ? `${line.slice(0, SPOKEN_CHARS - 1).trimEnd()}…` : line;
}
