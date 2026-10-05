import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { logoTile } from '../logo-tile.ts';
import type { SheetForm } from './sheet-form.ts';
import type { SheetSteps } from './sheet-steps.ts';

/**
 * Returns a connection sheet laid out: the Connector's logo, name and pitch at the top, the fields across, the
 * steps in two columns, and in the footer the polling interval and the buttons that decide.
 * @example
 * sheetLayout(github, 'fr', { form, steps, buttons: [cancelButton, saveButton] });
 */
export function sheetLayout(
  connector: ConnectorView,
  lang: Language,
  parts: { readonly form: SheetForm; readonly steps: SheetSteps; readonly buttons: readonly HTMLElement[] },
): HTMLElement {
  const { form, steps } = parts;

  return element(
    'section',
    { className: 'sheet', attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title' } },
    [
      element('header', { className: 'sheet-head' }, [
        logoTile(connector.about.logo, 40),
        element('div', {}, [
          element('h2', { text: connector.title[lang], attributes: { id: 'sheet-title' } }),
          element('p', { text: connector.about.pitch[lang] }),
        ]),
      ]),
      element('div', { className: 'sheet-body' }, [
        form.fields,
        element('div', { className: 'sheet-col' }, steps.left),
        element('div', { className: 'sheet-col test-col' }, steps.right),
      ]),
      element('footer', { className: 'sheet-foot' }, [
        form.every.node,
        element('div', { className: 'row-end' }, parts.buttons),
      ]),
    ],
  );
}
