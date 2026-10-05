import { element } from '../element.ts';

/**
 * Returns a switch: a checkbox drawn as the macOS toggle, announced as a switch. `onToggle` receives what the
 * person asked for; the switch then shows what the app answers, on its next drawing.
 * @example
 * toggle('Open Deskorama at login', true, actions.setOpenAtLogin);
 */
export function toggle(label: string, checked: boolean, onToggle: (on: boolean) => void): HTMLInputElement {
  const input = element('input', {
    className: 'switch',
    attributes: { type: 'checkbox', role: 'switch', 'aria-label': label },
  });

  input.checked = checked;
  input.addEventListener('change', () => onToggle(input.checked));

  return input;
}
