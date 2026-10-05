import type { LoginItemState } from '../../shared/settings-snapshot.ts';

/** What the settings window needs from the Mac itself, so its actions can be tested without one. */
export interface SystemAccess {
  /** The current time, in milliseconds since the Unix epoch. */
  now(): number;
  /** The Mac's accent colour, in the RGBA hexadecimal form macOS gives. */
  accent(): string;
  /** The Mac's preferred languages, most preferred first. */
  languages(): readonly string[];
  loginItem(): LoginItemState;
  setOpenAtLogin(on: boolean): LoginItemState;
  /** Opens an address in the person's browser. */
  openExternal(url: string): void;
  /** Puts a text on the clipboard. */
  copy(text: string): void;
}
