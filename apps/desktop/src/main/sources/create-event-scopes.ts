import type { SourceEvent } from '@deskorama/core';

/**
 * Returns what gives an Event an id no other Source's Event has: the id its Source gave it, after a number proper
 * to the address it was read from. The engine tells Sources apart by their name alone, and two Sources may share a
 * name, or one keep its name while it moves to another repository: each numbers its pull requests from 1, so without
 * this the second Event with an id would be taken for a replay of the first.
 * @example
 * const scoped = createEventScopes();
 * scoped('["src-1","github","tramlo/web"]', merged).id; // "1:pr-12-merged"
 * scoped('["src-2","github","tramlo/api"]', merged).id; // "2:pr-12-merged"
 * scoped('["src-1","github","tramlo/web"]', opened).id; // "1:pr-13-opened"
 */
export function createEventScopes(): (address: string, event: SourceEvent) => SourceEvent {
  const scopes = new Map<string, number>();

  return (address, event) => {
    const scope = scopes.get(address) ?? scopes.size + 1;

    scopes.set(address, scope);

    return { ...event, id: `${scope}:${event.id}` };
  };
}
