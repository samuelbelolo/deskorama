/**
 * Fills `container` with one button per value, the `selected` one pressed; a click presses it and calls `pick`.
 * Called again to change the language or the selection.
 * @example
 * renderButtonGroup(speeds, [1, 10, 60], (speed) => `×${speed}`, 10, (speed) => simulator.setSpeed(speed));
 * // three buttons, "×10" pressed; a click on "×60" presses it and calls simulator.setSpeed(60)
 */
export function renderButtonGroup(
  container: HTMLElement,
  values: readonly number[],
  label: (value: number) => string,
  selected: number,
  pick: (value: number) => void,
): void {
  const buttons = values.map((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'group-button';
    button.dataset['value'] = String(value);
    button.textContent = label(value);
    button.setAttribute('aria-pressed', String(value === selected));

    button.addEventListener('click', () => {
      for (const each of buttons) each.setAttribute('aria-pressed', String(each === button));
      pick(value);
    });

    return button;
  });

  container.replaceChildren(...buttons);
}
