import type { Archetype } from './archetype.ts';
import type { DeployStep } from './deploy-step.ts';
import type { GaugeMove } from './gauge-move.ts';
import type { Rarity } from './rarity.ts';

/**
 * An Event as a Theme receives it: one thing that happened in a Source, with its strings already in the
 * display language. A Theme dispatches on `archetype` only and paints `label`, `meta.detail` and `meta.tag`.
 */
export interface WallpaperEvent {
  /** Stable per Source, used to dedupe replays. */
  readonly id: string;
  /** The Source's own name for the event; Themes never dispatch on it. */
  readonly kind: string;
  /** The Role; null for a kind from a foreign Source, which plays the generic Gag. */
  readonly archetype: Archetype | null;
  /** False when the Source sent a kind nobody described; plays the generic Gag. */
  readonly recognised: boolean;
  readonly rarity: Rarity;
  /** The plain fact, in the display language. */
  readonly label: string;
  /** The Source's display name. */
  readonly source: string;
  readonly at: Date;
  readonly meta: EventMeta;
  /** Present on events that move a Gauge. */
  readonly gauge?: GaugeMove;
}

/** The structured fields of a {@link WallpaperEvent}. */
export interface EventMeta {
  /** One concrete line, never personal data. */
  readonly detail: string;
  /** About 12 characters to paint on a prop; may be empty. */
  readonly tag: string;
  /** Deploy events only. */
  readonly step?: DeployStep;
}
