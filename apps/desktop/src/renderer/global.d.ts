import type { SettingsBridge } from '../shared/settings-bridge.ts';
import type { WallpaperBridge } from '../shared/wallpaper-bridge.ts';

declare global {
  interface Window {
    /** The bridge the wallpaper preload exposes; see `WallpaperBridge`. Absent from the settings page. */
    readonly wallpaper: WallpaperBridge;
    /** The bridge the settings preload exposes; see `SettingsBridge`. Absent from the wallpaper pages. */
    readonly settings: SettingsBridge;
  }
}
