import type { ShippedThemeId } from '../../../shared/theme-choice.ts';
import { AVAILABLE_THEMES } from '../../../shared/theme-choice.ts';
import { element } from '../element.ts';
import { THEME_ABOUTS } from '../theme-abouts.ts';

/**
 * Returns the Themes as thumbnails of their real pictures, the one on the desktop ringed with the accent colour.
 * Choosing another calls `choose`.
 * @example
 * themeThumbs('Theme', 'aeroport', 'day', (theme) => setPreferences({ theme }));
 */
export function themeThumbs(
  label: string,
  chosen: ShippedThemeId,
  time: 'day' | 'night',
  choose: (theme: ShippedThemeId) => void,
): HTMLElement {
  const thumbs = AVAILABLE_THEMES.map((id) => {
    const about = THEME_ABOUTS[id];

    return element(
      'button',
      {
        className: 'theme-thumb',
        attributes: { type: 'button', role: 'radio', 'aria-checked': String(id === chosen), 'data-theme': id },
        onClick: () => {
          if (id !== chosen) choose(id);
        },
      },
      [
        element('span', { className: 'thumb-frame' }, [
          element('img', { attributes: { src: about.pictures[time], alt: '' } }),
        ]),
        element('span', { className: 'thumb-name', text: about.name }),
      ],
    );
  });

  return element('div', { className: 'theme-thumbs', attributes: { role: 'radiogroup', 'aria-label': label } }, thumbs);
}
