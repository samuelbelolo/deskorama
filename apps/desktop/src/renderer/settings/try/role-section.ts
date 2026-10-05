import type { Archetype, Language, ThemeAbout } from '@deskorama/core';
import { element } from '../element.ts';
import { roleIcon } from '../role-icon.ts';
import { ROLE_NAMES } from '../role-names.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { RARE_ROLES, type RoleGroupId } from './role-groups.ts';

/**
 * Returns one group of Roles: its title, then a row per Role with its glyph, its name, what the Theme plays for it
 * in the Theme's own words, and the play button `play` makes for it.
 * @example
 * roleSection({ id: 'money', roles: ['money', 'blocked', 'error'] }, IMMEUBLE_ABOUT, 'en', play);
 * // "Money and intruders", then Money "The cash register goes KA‑CHING, or coins drop into the piggy bank." [▶] …
 */
export function roleSection(
  group: { readonly id: RoleGroupId; readonly roles: readonly Archetype[] },
  about: ThemeAbout,
  lang: Language,
  play: (role: Archetype) => HTMLElement,
): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  const rows = group.roles.map((role) =>
    element('div', { className: 'row role-row' }, [
      roleIcon(role),
      element('div', { className: 'row-label' }, [
        element('span', { className: 'role-name' }, [
          element('span', { text: ROLE_NAMES[role][lang] }),
          RARE_ROLES.includes(role) ? element('span', { className: 'tag', text: text.rare }) : null,
        ]),
        element('span', { className: 'sub', text: about.gags[role][lang] }),
      ]),
      play(role),
    ]),
  );

  return element('section', { className: 'role-group' }, [
    element('h2', { className: 'section-title', text: text.roleGroups[group.id] }),
    element('div', { className: 'group' }, rows),
  ]);
}
