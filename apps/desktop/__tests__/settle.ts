/**
 * Lets pending promises settle: they all run before Node's next turn.
 * @example
 * clock.advance(60_000);
 * await settle(); // the poll the timer started has finished
 */
export function settle(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
