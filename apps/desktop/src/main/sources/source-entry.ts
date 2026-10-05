/** A Source the person connected, as `settings.json` keeps it: everything but its token, which is in the Keychain. */
export interface SourceEntry {
  /** Generated when the Source is added; names its Keychain item and its cursor. */
  readonly id: string;
  /** The `id` of the Connector that reads it, e.g. "feed". */
  readonly connector: string;
  /** The name shown with its Events and in the menu bar. */
  readonly name: string;
  /** The values of the Connector's fields, by key. */
  readonly values: Readonly<Record<string, string>>;
  /** The values of the Connector's fields that hold several, by key; left out by a Source that has none. */
  readonly lists?: Readonly<Record<string, readonly string[]>> | undefined;
  /** The polling interval the person chose, in milliseconds; the Connector's default when left out. */
  readonly interval?: number | undefined;
}
