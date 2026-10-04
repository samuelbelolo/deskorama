/**
 * Makes `button` a toggle: each click flips its pressed state, swaps its page-text key between the two given, and
 * calls `change` with the new state. It starts released. The words themselves appear once the caller applies the
 * page text again.
 * @example
 * toggle(cover, ['cover', 'uncover'], (covered) => screens.setCovered(covered));
 * cover.click(); // aria-pressed "true", data-text "uncover", screens.setCovered(true)
 */
export function toggle(
  button: HTMLButtonElement,
  [released, pressed]: readonly [string, string],
  change: (pressed: boolean) => void,
): void {
  let on = false;

  button.dataset['text'] = released;
  button.setAttribute('aria-pressed', 'false');

  button.addEventListener('click', () => {
    on = !on;
    button.dataset['text'] = on ? pressed : released;
    button.setAttribute('aria-pressed', String(on));
    change(on);
  });
}
