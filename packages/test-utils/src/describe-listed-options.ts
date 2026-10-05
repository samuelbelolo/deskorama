import type { Connector, ConnectorOption, SourceSettings } from '@deskorama/core';
import { expect, test } from 'vitest';
import { createFakeFetch, type Responder } from './create-fake-fetch.ts';
import { describeReportedFailures } from './describe-reported-failures.ts';
import { isLoadedField } from './is-loaded-field.ts';

/** What the shared suite needs to load the options of one field of a Connector. */
export interface ListedOptionsCase {
  /** The key of a field picked among loaded options. */
  readonly field: string;
  /**
   * Returns a fresh responder that answers every request of one loading from recorded responses, with at least one
   * option.
   */
  readonly recorded: () => Responder;
}

/**
 * Registers the tests of one field a Connector loads the options of: a recorded answer gives options a person can
 * tell apart, and each failure a service can answer becomes the `ConnectorError` the platform acts on, the
 * missing permission named among those the Connector asks for. A loading is played with the token and what the
 * field needs, nothing more, as the settings window asks for it.
 * @example
 * describeListedOptions(createVercel(), settings, now, { field: 'projects', recorded: () => () => projectsPage });
 */
export function describeListedOptions(
  connector: Connector,
  settings: SourceSettings,
  now: number,
  listed: ListedOptionsCase,
): void {
  const { field } = listed;

  const declared = connector.config.fields.find((candidate) => candidate.key === field);
  const needs = declared !== undefined && isLoadedField(declared) ? declared.needs : [];

  const asked: SourceSettings = {
    name: settings.name,
    token: settings.token,
    values: Object.fromEntries(needs.map((key) => [key, settings.values[key] ?? ''])),
  };

  /**
   * Returns the options the Connector lists for the field when the service answers with `respond`, asked with the
   * token and what the field needs.
   * @example
   * await list(() => projectsPage); // [{ value: 'prj_web', label: 'tramlo-web' }]
   */
  const list = async (respond: Responder): Promise<readonly ConnectorOption[]> => {
    if (connector.listOptions === undefined) throw new Error(`${connector.id} declares no listOptions`);

    const input = { field, settings: asked, fetch: createFakeFetch(respond).fetch, now };

    return connector.listOptions(input);
  };

  test(`lists the options of "${field}", each with its own value and a name`, async () => {
    for (const key of needs) expect((settings.values[key] ?? '').trim()).not.toBe('');

    const options = await list(listed.recorded());

    expect(options.length).toBeGreaterThan(0);
    expect(new Set(options.map((option) => option.value.trim())).size).toBe(options.length);

    for (const option of options) {
      expect(option.value).toBe(option.value.trim());
      expect(option.value).not.toBe('');
      expect(option.label.trim()).not.toBe('');
    }
  });

  describeReportedFailures({
    what: `listing "${field}"`,
    call: list,
    permissions: connector.config.permissions.map((permission) => permission.name),
    now,
  });
}
