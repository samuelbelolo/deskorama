/**
 * Returns what `read` gives for each item, sending one request after the other: GitHub asks clients to send
 * requests serially rather than concurrently, to stay within its secondary rate limits.
 * @example
 * await inSequence([5101, 5103], (id) => readRun(session, id)); // [run5101, run5103], read in that order
 */
export async function inSequence<Item, Result>(
  items: readonly Item[],
  read: (item: Item) => Promise<Result>,
): Promise<Result[]> {
  return items.reduce<Promise<Result[]>>(
    async (done, item) => [...(await done), await read(item)],
    Promise.resolve([]),
  );
}
