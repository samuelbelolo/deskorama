import type { Archetype } from '@deskorama/core';

/** An Event as the settings window shows it: its words in the display language, when it happened and its Role. */
export interface SeenEvent {
  readonly label: string;
  readonly detail: string;
  /** When it happened, in milliseconds since the Unix epoch. */
  readonly at: number;
  /** The Role it plays on the wallpaper; null for an Event no one described. */
  readonly archetype: Archetype | null;
}
