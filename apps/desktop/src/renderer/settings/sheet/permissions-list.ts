import type { ConnectorPermission, Language } from '@deskorama/core';
import { element } from '../element.ts';
import { icon } from '../icon.ts';

/**
 * Returns the permissions to tick when creating the token, each under the name its service gives it and with why
 * the Connector needs it: all of it is the Connector's own.
 * @example
 * permissionsList(stripe.permissions, 'en'); // "Payment Intents: Read", "Subscriptions: Read"
 */
export function permissionsList(permissions: readonly ConnectorPermission[], lang: Language): HTMLElement {
  return element(
    'ul',
    { className: 'permissions' },
    permissions.map((permission) =>
      element('li', {}, [
        icon('check-square-fill'),
        element('span', {}, [
          element('code', { text: permission.name }),
          element('span', { className: 'why', text: permission.why[lang] }),
        ]),
      ]),
    ),
  );
}
