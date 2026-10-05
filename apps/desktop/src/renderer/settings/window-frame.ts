import { iconButton } from './controls/icon-button.ts';
import { element } from './element.ts';

/** The parts of the window that stay while its content is drawn again. */
export interface WindowFrame {
  readonly sidebar: HTMLElement;
  /** The column right of the sidebar: the toolbar and the pane. */
  readonly content: HTMLElement;
  readonly back: HTMLButtonElement;
  readonly forward: HTMLButtonElement;
  readonly title: HTMLElement;
  readonly pane: HTMLElement;
  /** Where the one open sheet is shown, over everything else. */
  readonly sheetLayer: HTMLElement;
}

/**
 * Builds the window's frame into `root`: a sidebar, a content column with a toolbar (back, forward, the pane's
 * title) over the pane, and the layer of sheets. The toolbar and the top of the sidebar are where the window is
 * dragged from, since its title bar is hidden.
 * @example
 * const frame = buildWindowFrame(document.querySelector('#settings'), { back: goBack, forward: goForward });
 * frame.title.textContent = 'Sources';
 */
export function buildWindowFrame(
  root: HTMLElement,
  go: { readonly back: () => void; readonly forward: () => void },
): WindowFrame {
  const sidebar = element('aside', { className: 'sidebar' });

  const back = iconButton('caret-left', '', go.back);
  const forward = iconButton('caret-right', '', go.forward);
  const title = element('h1', { attributes: { id: 'pane-title' } });
  const pane = element('div', { className: 'pane' });

  const content = element('main', { className: 'content', attributes: { 'aria-labelledby': 'pane-title' } }, [
    element('header', { className: 'toolbar' }, [element('div', { className: 'toolbar-nav' }, [back, forward]), title]),
    pane,
  ]);

  const sheetLayer = element('div', { className: 'sheet-layer' });

  sheetLayer.hidden = true;

  root.classList.add('window');
  root.replaceChildren(sidebar, content, sheetLayer);

  return { sidebar, content, back, forward, title, pane, sheetLayer };
}
