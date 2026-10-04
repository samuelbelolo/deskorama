import {
  ConnectorError,
  type Connector,
  type ConnectorFailure,
  type PollInput,
  type PollResult,
} from '@deskorama/core';

/** One scripted answer of a poll: a result, or a failure to throw. */
export type Script = PollResult | ConnectorFailure;

/** A Connector that answers its polls from a script, and the inputs it received. */
export interface ScriptedConnector {
  readonly connector: Connector;
  readonly inputs: PollInput[];
}

/**
 * Returns a Connector whose polls answer `scripts` in order, then nothing new, polled every minute by default.
 * @example
 * const { connector, inputs } = scriptedConnector([{ events: [merged], cursor: 'c1' }, { kind: 'network' }]);
 */
export function scriptedConnector(scripts: readonly Script[]): ScriptedConnector {
  const inputs: PollInput[] = [];
  let next = 0;

  const connector: Connector = {
    id: 'scripted',
    title: { fr: 'Scripté', en: 'Scripted' },
    config: { fields: [], permissions: [], interval: { min: 30_000, default: 60_000, max: 600_000 } },
    gauges: {
      crowd: { max: 10, text: { fr: { label: 'a', short: 'A' }, en: { label: 'a', short: 'A' } } },
      daily: { text: { fr: { label: 'b', short: 'B' }, en: { label: 'b', short: 'B' } } },
      total: { text: { fr: { label: 'c', short: 'C' }, en: { label: 'c', short: 'C' } } },
    },
    async poll(input) {
      inputs.push(input);

      const script = scripts[next++] ?? { events: [], cursor: input.cursor };

      if ('kind' in script) throw new ConnectorError(script, `scripted ${script.kind}`);

      return script;
    },
  };

  return { connector, inputs };
}
