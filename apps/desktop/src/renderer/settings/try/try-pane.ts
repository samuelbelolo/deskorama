import type { Clock, ThemeMoment } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import { AVAILABLE_THEMES } from '../../../shared/theme-choice.ts';
import { segmented } from '../controls/segmented.ts';
import { element } from '../element.ts';
import { ROLE_NAMES } from '../role-names.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { THEME_ABOUTS } from '../theme-abouts.ts';
import type { WindowActions, WindowView } from '../window-view.ts';
import { jackpotCard } from './jackpot-card.ts';
import { playButton } from './play-button.ts';
import { ROLE_GROUPS, type RoleGroup } from './role-groups.ts';
import { roleSection } from './role-section.ts';

/**
 * Returns the Try pane: the failed deploy first, with the real picture of the Theme's big scene, then every Role
 * in groups, each with what the Theme on the desktop plays for it, in the Theme's own words, and a play button.
 * The Theme picked here is the one on the desktop: a test can only play where the wallpaper is. Playing a test
 * says so under the list without drawing the pane again, so the button pressed stays the one the person sees.
 * @example
 * tryPane(view, actions, bridge, clock); // [lead and Theme, the failed deploy, two columns of Roles, what was played]
 */
export function tryPane(
  view: WindowView,
  actions: WindowActions,
  bridge: Pick<SettingsBridge, 'playTest'>,
  clock: Clock,
): Node[] {
  const { lang, wallpaper } = view.snapshot;
  const text = SETTINGS_TEXT[lang];
  const about = THEME_ABOUTS[wallpaper.theme];

  const played = element('p', {
    className: 'played',
    text: view.played,
    attributes: { role: 'status', 'aria-live': 'polite' },
  });

  /** Returns the button that plays one moment on the wallpaper and says so under the list. */
  const play = (moment: ThemeMoment): HTMLButtonElement => {
    const name = ROLE_NAMES[moment][lang];
    const said = text.played(name, about.name);

    const playIt = (): void => {
      // A test the main process refuses leaves nothing to draw again.
      void bridge.playTest(moment).catch(() => {});

      played.textContent = said;
      actions.setPlayed(said);
    };

    return playButton(text.play(name), playIt, clock);
  };

  const themes = AVAILABLE_THEMES.map((id) => ({ value: id, label: THEME_ABOUTS[id].name }));

  const head = element('div', { className: 'try-head' }, [
    element('p', { text: text.tryLead }),
    element('div', { className: 'try-target' }, [
      element('span', { className: 'muted', text: text.playsOn }),
      segmented(text.playsOn, themes, wallpaper.theme, (theme) => actions.setPreferences({ theme })),
    ]),
  ]);

  /** Returns one of the two columns: the groups it holds, top to bottom, in the order of the groups. */
  const column = (side: RoleGroup['column']): HTMLElement => {
    const groups = ROLE_GROUPS.filter((group) => group.column === side);

    return element(
      'div',
      { className: 'role-col' },
      groups.map((group) => roleSection(group, about, lang, play)),
    );
  };

  return [
    head,
    jackpotCard(about, lang, play('failed-deploy')),
    element('div', { className: 'role-groups' }, [column('left'), column('right')]),
    played,
  ];
}
