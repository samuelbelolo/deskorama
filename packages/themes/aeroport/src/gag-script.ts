import type { WallpaperEvent } from '@deskorama/core';
import type { Room, RoomRequest } from './find-room.ts';
import type { Stage } from './stage.ts';

/** A Gag's actors on stage: how to draw them at any instant, and where the Caption points. */
interface GagScene {
  /** Draws every actor at `elapsed` ms into the Gag: a pure function of time, so any frame can be drawn alone. */
  readonly draw: (elapsed: number) => void;
  /** The horizontal centre of the Caption, over the actor it is about. */
  readonly captionX: number;
}

/** One Gag written as a script: how long it plays, its key pose, the room it asks for and how it sets its stage. */
export interface GagScript {
  readonly duration: number;
  /** The instant that tells the story alone; with reduced motion the Gag holds it from start to end. */
  readonly keyPose: number;
  /** The room the Gag needs, or several sizes of it, tried in order. */
  readonly room: (stage: Stage, event: WallpaperEvent) => RoomRequest | readonly RoomRequest[];
  /** Sets the actors into `layer`, a fresh layer of the root that is removed with them when the Gag ends. */
  readonly build: (stage: Stage, event: WallpaperEvent, room: Room, layer: HTMLElement) => GagScene;
  /** How long the Gag waits for room before it gives up, when a rare Gag waits longer than the others. */
  readonly patience?: number;
}
