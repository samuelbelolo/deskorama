import type { Language } from '@deskorama/core';
import type { ConnectorView, SourceView } from '../../../shared/settings-snapshot.ts';
import { agoText } from '../ago-text.ts';
import { pushButton } from '../controls/push-button.ts';
import { element } from '../element.ts';
import { logoTile } from '../logo-tile.ts';
import { sourceStanding } from '../source-standing.ts';
import { statusLine } from '../status-line.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { sourceMenu } from './source-menu.ts';
import { sourcePlace } from './source-place.ts';

/** What a row's buttons do. */
export interface SourceRowActions {
  readonly edit: (source: SourceView) => void;
  readonly remove: (source: SourceView) => void;
}

/**
 * Returns the row of a connected Source: its Connector's logo, its name, its service and where it reads (how many
 * projects or events when it follows several), where it stands, and the last Event it sent. A Source only the person can fix tints its row and offers that fix as its
 * main button; removing sits in the "more" menu.
 * @example
 * sourceRow(kavelo, stripe, now, 'fr', { edit, remove });
 * // Kavelo, "Il manque la permission « Subscriptions: Read » au jeton.", [Corriger le jeton] […]
 */
export function sourceRow(
  source: SourceView,
  connector: ConnectorView,
  now: number,
  lang: Language,
  actions: SourceRowActions,
): HTMLElement {
  const text = SETTINGS_TEXT[lang];
  const standing = sourceStanding(source.status, lang);

  const place = sourcePlace(source, connector, lang) || connector.about.token.name[lang];

  const last =
    source.last === null
      ? null
      : element('span', {
          className: 'source-last',
          text: text.lastEvent(source.last.label, agoText(source.last.at, now, lang)),
        });

  const fixes = { token: text.fixToken, permission: text.fixPermission };
  const main = pushButton(standing.fix === null ? text.edit : fixes[standing.fix], () => actions.edit(source));

  const menu = sourceMenu(text.more(source.name), [
    { label: text.edit, onChoose: () => actions.edit(source) },
    { label: text.remove, danger: true, onChoose: () => actions.remove(source) },
  ]);

  return element('div', { className: `row source-row ${standing.kind}`, attributes: { 'data-source': source.id } }, [
    logoTile(connector.about.logo, 34),
    element('div', { className: 'source-body' }, [
      element('div', { className: 'source-id' }, [
        element('span', { className: 'source-name', text: source.name }),
        element('span', { className: 'source-where', text: text.where(connector.title[lang], place) }),
      ]),
      statusLine(standing.kind, standing.sentence),
      last,
    ]),
    element('div', { className: 'row-end' }, [main, menu]),
  ]);
}
