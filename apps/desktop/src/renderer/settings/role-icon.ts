import type { Archetype } from '@deskorama/core';
import { element } from './element.ts';
import { icon, type IconName } from './icon.ts';

/** The glyph of each Role: typed by `Archetype`, so a new Role does not compile until it has one. */
const ROLE_ICONS: Readonly<Record<Archetype, IconName>> = {
  arrival: 'sign-in',
  partner: 'handshake',
  departure: 'sign-out',
  approval: 'seal-check',
  rejection: 'x-circle',
  abandon: 'trash',
  like: 'heart',
  celebration: 'confetti',
  message: 'chat-circle-text',
  publish: 'flag',
  usage: 'lightning',
  money: 'coins',
  error: 'bug',
  blocked: 'prohibit',
  deploy: 'rocket-launch',
};

/**
 * Returns the small tinted tile that stands for a Role next to an Event or a test; an Event no one described gets
 * a neutral one.
 * @example
 * roleIcon('money'); // <span class="role-icon"> with the coins glyph
 * roleIcon(null); // <span class="role-icon"> with three dots
 */
export function roleIcon(role: Archetype | null): HTMLElement {
  return element('span', { className: 'role-icon' }, [icon(role === null ? 'dots-three' : ROLE_ICONS[role])]);
}
