import type { Cancel, Point, Rect, WallpaperEvent } from '@deskorama/core';
import type { DeployPlane } from './create-deploy-plane.ts';
import { createFireTruck, type FireTruck } from './create-fire-truck.ts';
import { createFoam, type Foam } from './create-foam.ts';
import { createSlate, type Slate } from './create-slate.ts';
import { crewMarkup } from './crew-markup.ts';
import { EASE } from './ease.ts';
import { failedDeployFrame } from './failed-deploy-frame.ts';
import type { FlightStage } from './flight.ts';
import { figureSprite, type FigureSprite } from './figure-sprite.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { markScene } from './mark-scene.ts';
import { runTimeline } from './run-timeline.ts';
import { sceneSpeech, type SceneLine, type SceneSpeech } from './scene-speech.ts';
import { towerLine } from './tower-line.ts';

/** How long the show plays; the plane and the truck stay afterwards, until the runway is cleared. */
const SHOW_MS = 10_000;

/** With reduced motion, the instant held still: the truck foaming, both crew arguing, the tower on the radio. */
const STILL_MS = 4000;

/** How long the slate lasts. */
const SLATE_MS = 6000;

/** The truck races in, then foams the plane while its stream lasts; its lamps blink a while after it stops. */
const TRUCK = { from: 150, to: 1250 } as const;
const FOAM = { start: 1350, grow: 5200, streamEnd: 7150 } as const;
const BLINK_AFTER_MS = 8000;

/** What a failed deploy leaves on the runway once its show is over. */
export interface Wreck {
  /** The scene's own layer, which holds the truck once the show is over. */
  readonly layer: HTMLElement;
  readonly truck: FireTruck;
  /** Where the plane and the truck stand, to keep every Gag off them. */
  readonly box: Rect;
  /** Stops the show if it still plays; the truck stays, the foam stays on the plane. */
  readonly stop: Cancel;
}

/**
 * Plays the failed deploy on the terminal side, the one legendary scene: the PROD Caravelle at the threshold coughs,
 * lurches and stops dead; the fire truck races in and foams it into a meringue; two ground crew argue; the tower
 * calls for help; the airport dims around the plane; and the signature line shows wherever the windows leave room.
 * Nobody is hurt: the plane just sulks on the runway until the next deploy.
 * @example
 * const wreck = playJackpot(stage, plane, deployFailed);
 */
export function playJackpot(stage: FlightStage, plane: DeployPlane, event: WallpaperEvent): Wreck {
  const { host, layout } = stage;
  const hold = plane.pose();
  const hull = plane.box();
  const cast = castJackpot(stage, plane);

  const frame = failedDeployFrame(stage, event, {
    near: { x: hull.x + 225, y: hull.y - 70 },
    cast: { x: 0, y: hull.y - 90, w: cast.truckX + 320, h: layout.height - hull.y + 90 },
    show: SHOW_MS,
  });

  const draw = (elapsed: number): void => {
    plane.place(cough(hold, elapsed));
    cast.slate.draw(elapsed);
    driveIn(cast.truck, elapsed, { from: layout.width + 40, to: cast.truckX, feet: cast.feet });
    cast.foam.draw(elapsed, { nozzle: cast.truck.nozzle(), target: hoseTarget(hull, elapsed) }, host.reducedMotion);
    cast.crew.forEach((member, i) => member.place(cast.crewX + i * 46, cast.feet, crewOpacity(elapsed, i)));
    cast.speech.draw(elapsed);
  };

  const show = runTimeline(host.clock, host.reducedMotion, { duration: SHOW_MS, still: STILL_MS, draw }, cast.clear);

  return {
    layer: cast.layer,
    truck: cast.truck,
    box: { x: hull.x, y: hull.y, w: cast.truckX + 190 - hull.x, h: layout.height - hull.y },
    stop() {
      show();
      frame();
      cast.clear();
    },
  };
}

/** The players of the failed deploy, set on stage, and where they stand. */
interface JackpotCast {
  readonly layer: HTMLElement;
  readonly slate: Slate;
  readonly truck: FireTruck;
  readonly foam: Foam;
  readonly crew: readonly FigureSprite[];
  readonly speech: SceneSpeech;
  readonly truckX: number;
  readonly crewX: number;
  readonly feet: number;
  /** Takes the slate, the stream, the crew and their bubbles down; the truck stays, the foam stays on the plane. */
  readonly clear: () => void;
}

/**
 * Sets the failed deploy's players around the stranded plane, in a layer of their own: the slate under the plane,
 * the fire truck and its foam, the two arguing crew beside the truck, and every line said.
 * @example
 * const cast = castJackpot(stage, plane);
 * cast.truck.place(cast.truckX, cast.feet, 'steady', 0);
 */
function castJackpot(stage: FlightStage, plane: DeployPlane): JackpotCast {
  const { host, layout, text } = stage;
  const hull = plane.box();
  const truckX = hull.x + 480;
  const crewX = truckX + 215;
  const feet = layout.taxiwayTop + 14;

  const layer = document.createElement('div');
  layer.className = 'aeroport-gag';
  stage.root.append(layer);

  const slate = createSlate(stage.root, { x: hull.x + 240, y: hull.y + 70 }, SLATE_MS, plane.node);
  const truck = createFireTruck(layer, text.paint.truck);
  const foam = createFoam(plane.art, layer, FOAM);
  const crew = [crewMarkup('up'), crewMarkup('out')].map((art, i) => {
    const member = figureSprite(layer, art, { scale: 2, facingLeft: i === 1, part: 'arguing-crew' });
    markScene(member.node);

    return member;
  });
  const lines = [...crewLines(stage, { x: crewX, y: feet }), towerLine(layout, text.jackpot.tower, 2000, 7200)];
  const speech = sceneSpeech(layer, host, lines);

  const clear = (): void => {
    slate.dispose();
    foam.dispose();
    speech.dispose();
    for (const member of crew) member.node.remove();
  };

  return { layer, slate, truck, foam, crew, speech, truckX, crewX, feet, clear };
}

/**
 * Drives the fire truck in from beyond the right edge to its stop by the plane, its lamps blinking while it races
 * and for a while after, then lit steady while it stands by.
 * @example
 * driveIn(truck, 700, { from: 1480, to: 510, feet: 756 });
 */
function driveIn(truck: FireTruck, elapsed: number, route: { from: number; to: number; feet: number }): void {
  const arrive = EASE.out(
    keyframe(elapsed, [
      [TRUCK.from, 0],
      [TRUCK.to, 1],
    ]),
  );
  const lights = elapsed < TRUCK.to + BLINK_AFTER_MS ? 'blinking' : 'steady';

  truck.place(lerp(route.from, route.to, arrive), route.feet, lights, elapsed);
}

/**
 * Returns the crew's four lines, the first speaker's bubbles on the left of their head, the second's on the right,
 * so the exchange never overlaps.
 * @example
 * crewLines(stage, { x: 725, y: 756 })[0].line; // "Ça marchait en local !"
 */
function crewLines(stage: FlightStage, at: Point): SceneLine[] {
  const [first, second, again, answer] = stage.text.jackpot.crew;
  const left = { head: { x: at.x, y: at.y - 58 }, room: { x: at.x - 300, y: 0, w: 312, h: at.y } };
  const right = { head: { x: at.x + 46, y: at.y - 58 }, room: { x: at.x + 34, y: 0, w: 300, h: at.y } };

  return [
    { ...left, line: first, from: 1500, to: 4500 },
    { ...right, line: second, from: 1900, to: 4700 },
    { ...left, line: again, from: 5200, to: 7600 },
    { ...right, line: answer, from: 5900, to: 8500 },
  ];
}

/**
 * Returns the plane's pose as its engines cough: it lurches forward, stops dead and dips its nose in a sulk.
 * @example
 * cough({ x: 255, y: 814, r: 0 }, 400); // { x: 289, y: 814, r: about -1 }
 */
function cough(hold: { x: number; y: number }, elapsed: number): { x: number; y: number; r: number } {
  const p = elapsed / 1100;
  const lurch = keyframe(p, [
    [0, 0],
    [0.35, 34],
    [0.5, 30],
    [1, 30],
  ]);
  const sulk = keyframe(p, [
    [0, 0],
    [0.35, 0],
    [0.5, 3.2],
    [0.65, -1],
    [0.8, 1.4],
    [1, 0],
  ]);

  return { x: hold.x + lurch, y: hold.y, r: sulk };
}

/**
 * Returns where the foam lands on the hull: the stream sweeps from the nose to the tail and back.
 * @example
 * hoseTarget({ x: 30, y: 692, w: 450, h: 129 }, 0); // { x: 430, y: 762 }
 */
function hoseTarget(hull: Rect, elapsed: number): Point {
  const sweep = (elapsed % 2400) / 2400;

  return { x: hull.x + lerp(400, 130, sweep), y: hull.y + 70 };
}

/**
 * Returns how much one crew member shows: they pop up beside the truck, the second a moment after the first, and
 * walk off when the show ends.
 * @example
 * crewOpacity(1500, 0); // 0.5
 */
function crewOpacity(elapsed: number, index: number): number {
  const enter = FOAM.start + index * 200;

  return keyframe(elapsed, [
    [enter, 0],
    [enter + 300, 1],
    [SHOW_MS - 600, 1],
    [SHOW_MS - 100, 0],
  ]);
}
