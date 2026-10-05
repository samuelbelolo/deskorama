import { element } from '../element.ts';
import { icon } from '../icon.ts';

/** One numbered step of the connection sheet. */
export interface Step {
  readonly node: HTMLElement;
  /** Turns the step's number into a check, or back. */
  readonly setDone: (done: boolean) => void;
}

/**
 * Returns a numbered step: a mark that turns into a check once done, a title, an optional control beside the
 * title, and a body.
 * @example
 * const paste = step(3, 'Paste the token', [tokenField, keychainNote]);
 * paste.setDone(true); // the 3 becomes a check
 */
export function step(number: number, title: string, body: readonly (Node | null)[], aside: Node | null = null): Step {
  const mark = element('span', { className: 'step-mark', text: String(number), attributes: { 'aria-hidden': 'true' } });

  const node = element('div', { className: 'step' }, [
    element('h3', {}, [mark, element('span', { className: 'step-title', text: title }), aside]),
    element('div', { className: 'step-body' }, body),
  ]);

  return {
    node,
    setDone(done) {
      node.classList.toggle('done', done);

      if (done) mark.replaceChildren(icon('check'));
      else mark.textContent = String(number);
    },
  };
}
