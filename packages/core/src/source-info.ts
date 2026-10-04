import type { GaugeLabel } from './source-profile.ts';

/** What a Theme knows of the Source that names the scene, in the display language. */
export interface SourceInfo {
  /** The name to paint on signs; a Theme never hardcodes a product name. */
  readonly name: string;
  /** The Source's own words for its Gauges, to use on signs instead of naming the numbers. */
  readonly gauges: {
    /** With the crowd that fills the scene, for scaling. */
    readonly crowd: GaugeLabel & { readonly max: number };
    readonly daily: GaugeLabel;
    readonly total: GaugeLabel;
  };
}
