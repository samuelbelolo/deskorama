import { keepFocus } from './keep-focus.ts';
import type { PaneHistory } from './pane-history.ts';
import type { PaneId } from './pane-id.ts';
import { sidebar } from './sidebar.ts';
import { SETTINGS_TEXT } from './text/text-by-language.ts';
import type { WindowFrame } from './window-frame.ts';
import type { WindowView } from './window-view.ts';

/**
 * Draws the window's frame for what it shows now: the page's language, title and accent colour, the sidebar, the
 * toolbar's title and arrows, and `content` in the pane. The keyboard stays on the control that had it, in the
 * sidebar and in a pane that is the one already drawn, and such a pane stays where the person scrolled it.
 * @example
 * drawWindow(frame, view, history, { content: sourcesPane(view, actions), go: actions.go });
 */
export function drawWindow(
  frame: WindowFrame,
  view: WindowView,
  history: PaneHistory,
  parts: { readonly content: readonly Node[]; readonly go: (pane: PaneId) => void },
): void {
  const { snapshot, pane } = view;
  const text = SETTINGS_TEXT[snapshot.lang];
  const page = document.documentElement;

  page.lang = snapshot.lang;
  document.title = text.windowTitle;

  // Set through the style object: the page's Content Security Policy refuses a style attribute.
  if (snapshot.accent === null) page.style.removeProperty('--accent');
  else page.style.setProperty('--accent', snapshot.accent);

  keepFocus(frame.sidebar, () => frame.sidebar.replaceChildren(...sidebar(view, parts.go)));

  frame.title.textContent = text.panes[pane];
  frame.back.disabled = !history.canGoBack();
  frame.forward.disabled = !history.canGoForward();

  for (const [button, label] of [[frame.back, text.back] as const, [frame.forward, text.forward] as const]) {
    button.title = label;
    button.setAttribute('aria-label', label);
  }

  const samePane = frame.pane.dataset['pane'] === pane;
  const scrolled = samePane ? frame.pane.scrollTop : 0;
  const fill = (): void => frame.pane.replaceChildren(...parts.content);

  frame.pane.className = `pane pane-${pane}`;
  frame.pane.dataset['pane'] = pane;

  // Another pane is another page: nothing in it stands where the control that had the keyboard stood.
  if (samePane) keepFocus(frame.pane, fill);
  else fill();

  frame.pane.scrollTop = scrolled;
}
