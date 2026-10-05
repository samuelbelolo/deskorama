import type { Language } from './language.ts';

/** A logo drawn as one SVG path on a coloured tile, like an app icon, so a dark mark still reads on a dark window. */
export interface ConnectorLogo {
  /** The side of the square the path is drawn in: its SVG view box is `0 0 size size`. */
  readonly size: number;
  /** The mark, as the `d` of one SVG path. */
  readonly path: string;
  /** The colour of the mark, as a CSS hex colour. */
  readonly markColour: string;
  /** The colour of the tile behind the mark, as a CSS hex colour. */
  readonly tileColour: string;
}

/** The page of a service where its token is created. */
export interface ConnectorTokenPage {
  /** The service as its button names it, e.g. "GitHub". */
  readonly site: string;
  /** The `https://` address of the page. */
  readonly url: string;
  /**
   * The key of the field that holds the address of the person's own instance of the service, when there are several
   * (a region, a self-hosted copy): the page is then opened at this URL's path on that address.
   */
  readonly originField?: string;
}

/** Where a Source's token comes from, and what to choose when creating it. */
export interface ConnectorToken {
  /** What the service calls this kind of token, e.g. "Restricted key". */
  readonly name: Readonly<Record<Language, string>>;
  /** The page where it is created; null when it comes from the person's own backend. */
  readonly page: ConnectorTokenPage | null;
  /** What to choose on that page, in one or two short sentences. */
  readonly note: Readonly<Record<Language, string>>;
}

/** What anything a person can connect shows of itself: its logo and one line. */
export interface ConnectorCard {
  readonly logo: ConnectorLogo;
  /** One line of what its Source brings to the wallpaper. */
  readonly pitch: Readonly<Record<Language, string>>;
}

/** How a Connector presents itself where a person picks what to connect: the settings window never names a service. */
export interface ConnectorAbout extends ConnectorCard {
  readonly token: ConnectorToken;
}
