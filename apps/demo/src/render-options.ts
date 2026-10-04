/** One choice of a picker. */
export interface Option {
  readonly value: string;
  readonly label: string;
  /** Shown but not selectable, for what is not ready yet. */
  readonly disabled?: boolean;
}

/**
 * Fills a picker with its choices in the display language, `selected` chosen.
 * @example
 * renderOptions(select, [{ value: 'aeroport', label: 'L’Aéroport' }], 'aeroport');
 * // the <select> now holds one <option value="aeroport">, selected
 */
export function renderOptions(select: HTMLSelectElement, options: readonly Option[], selected: string): void {
  select.replaceChildren(
    ...options.map(({ value, label, disabled }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.disabled = disabled === true;
      option.selected = value === selected;

      return option;
    }),
  );
}
