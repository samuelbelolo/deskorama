import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions, WindowView } from '../window-view.ts';
import { generalGroup } from './general-group.ts';
import { sceneGroup } from './scene-group.ts';
import { themeHero } from './theme-hero.ts';
import { themeThumbs } from './theme-thumbs.ts';

/**
 * Returns the Wallpaper pane, after the macOS Wallpaper settings: the Theme on the desktop large, every Theme as a
 * thumbnail, then the general options and, once several Sources exist, which one names the scene and feeds each
 * Gauge. Every change applies at once.
 * @example
 * wallpaperPane(view, actions); // [the picture, "Theme", the thumbnails, "General", its group, …]
 */
export function wallpaperPane(view: WindowView, actions: WindowActions): Node[] {
  const { snapshot } = view;
  const text = SETTINGS_TEXT[snapshot.lang];

  const thumbs = themeThumbs(text.themes, snapshot.wallpaper.theme, view.time, (theme) =>
    actions.setPreferences({ theme }),
  );

  return [
    themeHero(view, actions),
    element('h2', { className: 'section-title', text: text.themes }),
    thumbs,
    element('h2', { className: 'section-title', text: text.general }),
    generalGroup(snapshot, actions),
    ...sceneGroup(snapshot, actions),
  ];
}
