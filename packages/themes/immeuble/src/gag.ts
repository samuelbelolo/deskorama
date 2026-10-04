import type { FreeSpot, Rect, ScreenHost, WallpaperEvent } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import type { Placement } from './create-placement.ts';
import type { Layout } from './layout.ts';
import type { Plaque } from './plaque.ts';
import type { Room } from './room.ts';

/** What every Gag plays with on one screen. */
export interface GagEnv {
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly copy: Copy;
  readonly place: Placement;
  /** The building's flats, three bays and two rows each, and whether someone is home. */
  flats(): readonly { readonly room: Room; readonly lit: boolean }[];
  /** Shakes the picture by whole native pixels for a while; nothing under reduced motion. */
  shake(pixels: number, ms: number): void;
  /** Makes the tenants of the lit rooms near a screen rectangle cheer until a Clock time. */
  cheerNear(rect: Rect, until: number): void;
}

/** A Gag on stage: its held room and plaque, its timeline, and how to draw any instant of it. */
export interface Act {
  /** How long the action lasts, before the key pose's hold is added. */
  readonly duration: number;
  /** The instant that tells the story alone: held 2.5 s, and the only one under reduced motion. */
  readonly keyT: number;
  /** The held room, in screen pixels. */
  readonly stage: FreeSpot;
  readonly plaque: Plaque;
  /** What the picture shows, for the mirror: "stamp", "thumb", "heart"... */
  readonly prop: string;
  /** Draws the actors at `t` ms of the Gag's own timeline. */
  draw(ctx: CanvasRenderingContext2D, t: number, now: number): void;
  /** Fades the Gag out over the last milliseconds of its action, the 16-bit blink; none when absent. */
  readonly blinkMs?: number;
  /** Something the Gag does once, at a moment of its run: a jolt, the neighbours' cheer. */
  readonly cue?: { readonly at: number; readonly run: (now: number) => void };
}

/** Sets an Event's Gag on stage, or returns null when no visible room can hold it and its plaque. */
export type Gag = (event: WallpaperEvent, env: GagEnv) => Act | null;
