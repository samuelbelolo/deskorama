import { segmented } from '../controls/segmented.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { THEME_ABOUTS } from '../theme-abouts.ts';
import type { WindowActions, WindowView } from '../window-view.ts';

/**
 * Returns the top of the Wallpaper pane: a real picture of the Theme on the desktop, by day or by night, with its
 * name and what it is in the Theme's own words.
 * @example
 * themeHero(view, actions); // the picture of L’Aéroport, "On your desktop", [Day | Night]
 */
export function themeHero(view: WindowView, actions: WindowActions): HTMLElement {
  const { lang, wallpaper } = view.snapshot;
  const text = SETTINGS_TEXT[lang];
  const about = THEME_ABOUTS[wallpaper.theme];

  const picture = element('img', { attributes: { src: about.pictures[view.time], alt: about.name } });

  const times = [
    { value: 'day', label: text.day },
    { value: 'night', label: text.night },
  ] as const;

  return element('div', { className: 'theme-hero' }, [
    element('figure', { className: 'theme-preview' }, [picture]),
    element('div', { className: 'theme-about' }, [
      element('span', { className: 'muted', text: text.themeNow }),
      element('h2', { text: about.name }),
      element('p', { text: about.pitch[lang] }),
      segmented(text.dayNight, times, view.time, actions.setTime),
      element('p', { className: 'muted small', text: text.dayNight }),
    ]),
  ]);
}
