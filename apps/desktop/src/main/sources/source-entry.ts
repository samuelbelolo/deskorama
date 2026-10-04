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
}
