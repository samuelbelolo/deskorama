/** Stops what a call started: a timer, a frame subscription, a mounted Theme. */
export type Cancel = () => void;

/**
 * The only source of time. Nothing reads the system time or schedules work directly, so every behaviour is
 * a function of the Clock: tests pass a fake one and step it by hand, the platform passes a real one.
 */
export interface Clock {
  /** Milliseconds since the Unix epoch. */
  now(): number;
  /** Runs `task` once, `ms` milliseconds from now. */
  after(ms: number, task: () => void): Cancel;
  /** Calls `listener` with the current time on every display frame until cancelled. */
  onFrame(listener: (now: number) => void): Cancel;
}
