import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { icon } from '../icon.ts';
import { logoTile } from '../logo-tile.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/**
 * Returns the catalogue: one tile per Connector the app offers, in the order it offers them, with the Connector's
 * own logo, name and one line of what it brings. Choosing one calls `connect`.
 * @example
 * catalogue(snapshot.connectors, 'en', (connector) => openSheet(connector)); // 8 tiles, GitHub first, the Feed last
 */
export function catalogue(
  connectors: readonly ConnectorView[],
  lang: Language,
  connect: (connector: ConnectorView) => void,
): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  const tiles = connectors.map((connector) =>
    element(
      'button',
      {
        className: 'service-tile',
        attributes: {
          type: 'button',
          'data-connector': connector.id,
          'aria-label': text.connect(connector.title[lang]),
        },
        onClick: () => connect(connector),
      },
      [
        logoTile(connector.about.logo, 34),
        element('span', { className: 'service-text' }, [
          element('span', { className: 'service-name', text: connector.title[lang] }),
          element('span', { className: 'service-pitch', text: connector.about.pitch[lang] }),
        ]),
        icon('plus'),
      ],
    ),
  );

  return element('div', { className: 'catalogue' }, tiles);
}
