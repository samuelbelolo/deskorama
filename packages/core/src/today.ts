import type { Archetype } from './archetype.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** What happened since midnight, identical on every screen. */
export interface Today {
  /** Events per Source kind since midnight. */
  readonly kinds: Readonly<Record<string, number>>;
  /** Events per Role since midnight; an Event without a Role counts in `kinds` only. */
  readonly roles: Readonly<Partial<Record<Archetype, number>>>;
  /** The latest deploy that succeeded or failed, whatever the day; null before the first one. */
  readonly lastDeploy: WallpaperEvent | null;
}
