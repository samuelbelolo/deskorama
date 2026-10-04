import type { Archetype } from './archetype.ts';
import type { DeployStep } from './deploy-step.ts';
import type { GaugeMove } from './gauge-move.ts';
import type { Language } from './language.ts';
import type { Rarity } from './rarity.ts';

/**
 * An Event as a Connector produces it: the same fields as a {@link WallpaperEvent}, with its words in every
 * display language. The engine hands each screen the words of its language.
 */
export interface SourceEvent {
  readonly id: string;
  readonly kind: string;
  readonly archetype: Archetype | null;
  readonly recognised: boolean;
  readonly rarity: Rarity;
  readonly source: string;
  readonly at: Date;
  /** The fact, the detail and the tag, in each display language. */
  readonly text: Readonly<Record<Language, EventText>>;
  readonly step?: DeployStep;
  readonly gauge?: GaugeMove;
}

/** The words of an Event in one language. */
export interface EventText {
  /** The plain fact. */
  readonly label: string;
  /** One concrete line, never personal data. */
  readonly detail: string;
  /** About 12 characters to paint on a prop; may be empty. */
  readonly tag: string;
}
