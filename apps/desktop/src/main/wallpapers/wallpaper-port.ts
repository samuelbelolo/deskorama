/** One wallpaper window as the main process drives it: its page receives messages, and it closes. */
export interface WallpaperPort {
  /** Sends one message to the window's page; a page still loading receives it once it listens. */
  send(channel: string, payload: unknown): void;
  /** Closes the window for good. */
  close(): void;
}
