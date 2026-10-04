import type { Archetype, GaugeMove, Language, Random, Rarity, SourceProfile } from '@deskorama/core';

/** Words in every display language: a label, or one entry of a fictional Source’s invented word lists. */
export type Words = Readonly<Record<Language, string>>;

/** The detail and the tag of one drawn Event, in every display language, and how it moves a Gauge. */
export interface Drawn {
  readonly text: Readonly<Record<Language, { readonly detail: string; readonly tag: string }>>;
  readonly gauge?: GaugeMove;
}

/** One kind of Event a fictional Source sends, at an invented rate. */
export interface DemoKind {
  /** The Source's own name for it, as a Connector would report it. */
  readonly kind: string;
  readonly archetype: Archetype;
  readonly rarity: Rarity;
  /** How many a day on average, before the hour of the day weighs it. */
  readonly perDay: number;
  /** Comes in bursts: one often brings a few more within minutes, as errors do. */
  readonly bursty?: boolean;
  readonly label: Words;
  /** Draws a concrete detail and tag; never a person's name. */
  readonly draw: (random: Random) => Drawn;
}

/** How a fictional Source's Gauges behave over a day. Every number is invented. */
interface DemoGauges {
  /** The usual crowd at an ordinary hour; the hour of the day scales it. */
  readonly crowdMedian: number;
  /** A short rush, e.g. people opening the app after a morning notification. */
  readonly crowdPeak?: { readonly from: number; readonly to: number; readonly factor: number };
  /** How much the daily Gauge reaches by midnight. */
  readonly dailyPerDay: number;
  /**
   * True when the Source's own Events move the daily Gauge (commits pushed, sign-ups), so it only grows with them;
   * false when nothing the Source sends counts it (page views), so it grows with time.
   */
  readonly dailyByEvents: boolean;
  /** The slow running total when the demo opens, and how much it wanders per minute. */
  readonly totalStart: number;
  readonly totalDrift: number;
}

/** How often a fictional Source ships, and what. */
export interface DemoDeploys {
  readonly perDay: number;
  /** Deploys only start during working hours, from `firstHour` to `lastHour`. */
  readonly firstHour: number;
  readonly lastHour: number;
  readonly failureChance: number;
  /** How long a build takes, in minutes of activity. */
  readonly buildMinutes: readonly [number, number];
  /** The apps that ship together: the front end or the back end. */
  readonly front: readonly string[];
  readonly back: readonly string[];
}

/** A fictional Source of the demo, standing in for a Connector: invented rates, `.example` domains, no real data. */
export interface DemoSource {
  readonly id: string;
  readonly profile: SourceProfile;
  /** What kind of system it is, for the Source picker. */
  readonly title: Words;
  /** One sentence on what it sends. */
  readonly pitch: Words;
  /** Activity weight for each hour of the day, 0 to 23, local time. */
  readonly hourly: readonly number[];
  readonly gauges: DemoGauges;
  readonly deploys: DemoDeploys;
  readonly kinds: readonly DemoKind[];
}
