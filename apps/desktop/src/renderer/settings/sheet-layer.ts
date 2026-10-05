/** The layer that holds the one sheet open over the window. */
export interface SheetLayer {
  /** Shows a sheet over the window and moves the keyboard into it; Escape runs `onDismiss`. */
  show(sheet: HTMLElement, onDismiss: () => void): void;
  /** Removes the sheet and gives the keyboard back to what had it. */
  hide(): void;
}

/** What can take the keyboard inside a sheet. */
const FOCUSABLE = 'input:not([disabled]), select:not([disabled]), button:not([disabled])';

/**
 * Returns the sheet layer of the window: while a sheet is shown, everything in `behind` is inert, as under a macOS
 * sheet, so neither the mouse nor the keyboard reaches it. Escape is heard on the whole page while a sheet is
 * shown, so it still closes one whose title or text was clicked, which leaves the keyboard on nothing. `onHidden`
 * runs once a sheet is gone and the keyboard is back where it was.
 * @example
 * const sheets = createSheetLayer(layer, [sidebar, content]);
 * sheets.show(confirmSheet(words, actions), () => sheets.hide());
 */
export function createSheetLayer(
  layer: HTMLElement,
  behind: readonly HTMLElement[],
  onHidden: () => void = () => {},
): SheetLayer {
  let dismiss: (() => void) | null = null;
  let returnTo: Element | null = null;

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || dismiss === null) return;

    event.preventDefault();
    dismiss();
  };

  return {
    show(sheet, onDismiss) {
      returnTo = returnTo ?? document.activeElement;
      dismiss = onDismiss;

      layer.replaceChildren(sheet);
      layer.hidden = false;

      for (const part of behind) part.inert = true;

      document.addEventListener('keydown', onKeydown);
      sheet.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    },

    hide() {
      dismiss = null;

      document.removeEventListener('keydown', onKeydown);
      layer.hidden = true;
      layer.replaceChildren();

      for (const part of behind) part.inert = false;

      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus();

      returnTo = null;

      onHidden();
    },
  };
}
