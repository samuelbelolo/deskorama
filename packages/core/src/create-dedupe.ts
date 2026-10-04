/** Tells an Event seen for the first time from a replay. */
export interface Dedupe {
  /** True the first time this Source sends this id; false for every replay. */
  firstTime(source: string, id: string): boolean;
}

/**
 * Returns a dedupe that remembers the last `capacity` Events, so a Source that returns a page again never plays an
 * Event twice, while an app that runs for weeks keeps a bounded memory.
 * @example
 * const dedupe = createDedupe(5000);
 * dedupe.firstTime('Tramlo', 'pr-418'); // true
 * dedupe.firstTime('Tramlo', 'pr-418'); // false
 * dedupe.firstTime('Mail', 'pr-418'); // true, another Source
 */
export function createDedupe(capacity: number): Dedupe {
  const seen = new Set<string>();
  return {
    firstTime(source, id) {
      // A separator no Source name contains, so "a" + "b:c" never meets "a:b" + "c".
      const key = `${source}\u0000${id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      // A Set iterates in insertion order: the first key is the oldest.
      for (const oldest of seen) {
        if (seen.size <= capacity) break;
        seen.delete(oldest);
      }
      return true;
    },
  };
}
