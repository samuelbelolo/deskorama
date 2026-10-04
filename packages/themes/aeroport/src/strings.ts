import type { Archetype, BuildState } from '@deskorama/core';

/** Three variants of one line, so a Gag that plays several times a day does not repeat itself word for word. */
export type Lines = readonly [string, string, string];

/** The Roles the board names with the airport's own status word when an Event has no tag. */
type BoardRole = Exclude<Archetype, 'deploy'>;

/** The three states of the runway, as the board's title band shows them. */
export type RunwayState = 'free' | 'busy' | 'closed';

/** A phrase with a count in it, `{n}`, in its singular and plural forms, picked by the language's plural rules. */
export interface Plural {
  readonly one: string;
  readonly other: string;
}

/** Every word L'Aéroport draws by itself, in one language. Event words come from the Event, never from here. */
export interface Strings {
  readonly airport: {
    /** Painted above the airport name on the terminal roof. */
    readonly welcome: string;
    /** The airport's name, a pun on production. */
    readonly name: string;
  };
  /** Words painted on buildings, vehicles and props. */
  readonly paint: {
    readonly terminal: string;
    readonly tower: string;
    readonly hangar: string;
    /** The airline painted on the parked plane. */
    readonly airline: string;
    readonly doors: Lines;
    /** The two lines of the sign planted by the rejected-baggage pile. */
    readonly pileSign: readonly [string, string];
    readonly security: string;
    /** On the flag, the stamp, the boarding pass and the placard when the Event has no tag. */
    readonly flag: string;
    readonly stamp: string;
    readonly pass: string;
    readonly placard: string;
    readonly cashVan: string;
    /** The till's ring when money comes in. */
    readonly kaching: string;
    /** The PROD flight's title on its fuselage, until a deploy christens it with its tag. */
    readonly flight: string;
    /** The airfield's cargo hangar, and the airline on the cargo plane parked in front of it. */
    readonly cargoHangar: string;
    readonly cargoAirline: string;
    /** The airfield's fire station, and the word on the side of its truck. */
    readonly station: string;
    readonly truck: string;
  };
  /** The airfield signs on the grass verge. */
  readonly signs: {
    /** The airport's word for each Gauge, under the Source's own short word. */
    readonly roles: { readonly crowd: string; readonly daily: string; readonly total: string };
    /** The two label lines of the deploy sign. */
    readonly deploy: string;
    readonly runway: string;
    /** What the deploy sign reads in each build state. */
    readonly build: Readonly<Record<BuildState, string>>;
  };
  /** The split-flap Departures board. Every word shown in its flaps must be on the drum. */
  readonly board: {
    /** The terminal's Departures board, then the airfield's Arrivals board. */
    readonly title: string;
    readonly arrivals: string;
    /** Runway 09 seen from the terminal, its far end 27 seen from the airfield. */
    readonly runway: string;
    readonly runwayFar: string;
    /** The painted column heads: time, flight, status. */
    readonly columns: readonly [string, string, string];
    readonly runwayState: Readonly<Record<RunwayState, string>>;
    /** The status of an Event of a kind nobody described. */
    readonly unknown: string;
    /** Words a shortened label drops in front ("NEW"), and may not end on ("OF"), separated by spaces. */
    readonly lead: string;
    readonly trail: string;
    /** The status of a row whose Event has no tag, by Role, 12 cells at most. */
    readonly roles: Readonly<Record<BoardRole, string>>;
  };
  /** What the people in the Gags say. */
  readonly lines: {
    /** Someone joining the crew, glad to be there, never taking command. */
    readonly newcomer: Lines;
    readonly guardStop: Lines;
    readonly bot: Lines;
    /** The guard of the cash van. */
    readonly guard: Lines;
    /** The radio's answer to a message. */
    readonly roger: string;
    /** The PROD flight's call sign, then the tower's clearance, `{callsign}` filled with it and the deploy's tag. */
    readonly callsign: string;
    readonly clearance: string;
  };
  /** The failed deploy: the crew's two exchanges, the tower's call, and the giant panel's two lines. */
  readonly jackpot: {
    readonly crew: readonly [string, string, string, string];
    readonly tower: string;
    /** Every letter is on the drum: the panel and the board flip them. */
    readonly panel: readonly [string, string];
  };
  /** The baggage belt that shows what was missed while the wallpaper was hidden. */
  readonly recap: {
    readonly title: string;
    /** How long the wallpaper was hidden, and how many Events it missed. */
    readonly hours: Plural;
    readonly minutes: Plural;
    readonly bags: Plural;
    /** The last suitcase: the missed Events the belt has no room to list. */
    readonly more: Plural;
    /**
     * A suitcase for several missed Events of one Role, which may be of different kinds: the Role in plain words,
     * with its count. `other` counts the Events with no Role.
     */
    readonly roles: Readonly<Record<Archetype | 'other', Plural>>;
  };
  /** What a screen reader announces for the whole picture. */
  readonly description: string;
}
