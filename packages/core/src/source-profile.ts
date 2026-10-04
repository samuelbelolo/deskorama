import type { Language } from './language.ts';

/** How a Source names one of its Gauges in one language. */
export interface GaugeLabel {
  /** The full label, e.g. "Commits today". */
  readonly label: string;
  /** One short word for a small sign, e.g. "COMMITS". */
  readonly short: string;
}

/** One Gauge of a Source, named in every display language. */
export interface SourceGauge {
  readonly text: Readonly<Record<Language, GaugeLabel>>;
}

/**
 * A Source as the engine knows it: the name shown on the scene and the words of its Gauges in every display
 * language. The engine hands each screen the words of its language as a {@link SourceInfo}.
 */
export interface SourceProfile {
  readonly name: string;
  readonly gauges: {
    /** The crowd, with the value that fills the scene, for scaling. */
    readonly crowd: SourceGauge & { readonly max: number };
    readonly daily: SourceGauge;
    readonly total: SourceGauge;
  };
}
