import { ARCHETYPES, DEPLOY_STEPS, GAUGE_ROLES, RARITIES } from '@deskorama/core';
import Ajv from 'ajv/dist/2020.js';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { FEED_PAGE_SCHEMA } from '../src/feed-page-schema.ts';
import { exampleNames } from './example-names.ts';
import { readDoc } from './read-doc.ts';

const validateWithJsonSchema = new Ajv({ strict: true, allErrors: true }).compile(
  v.parse(v.record(v.string(), v.unknown()), readDoc('feed-page.schema.json')),
);

/** The parts of the published schema that list the values of a closed set. */
const LIST = v.object({ enum: v.array(v.string()) });
const ENUMS = v.object({
  $defs: v.object({
    event: v.object({
      properties: v.object({
        archetype: v.object({ oneOf: v.tuple([LIST]) }),
        rarity: LIST,
        step: LIST,
        gauge: v.object({ properties: v.object({ role: LIST }) }),
      }),
    }),
  }),
});

/**
 * Returns whether the Feed itself accepts a page, through its Standard Schema interface.
 * @example
 * await feedAccepts({ events: [], next_cursor: null, has_more: false }); // true
 */
async function feedAccepts(page: unknown): Promise<boolean> {
  const result = await FEED_PAGE_SCHEMA['~standard'].validate(page);

  return result.issues === undefined;
}

describe('the published Feed format', () => {
  test.each(exampleNames('valid'))('accepts the valid example %s, in the JSON Schema and in the app', async (name) => {
    const page = readDoc(`examples/valid/${name}`);

    expect(validateWithJsonSchema(page) ? [] : validateWithJsonSchema.errors).toEqual([]);
    expect(await feedAccepts(page)).toBe(true);
  });

  test.each(exampleNames('invalid'))(
    'refuses the invalid example %s, in the JSON Schema and in the app',
    async (name) => {
      const page = readDoc(`examples/invalid/${name}`);

      expect(validateWithJsonSchema(page)).toBe(false);
      expect(await feedAccepts(page)).toBe(false);
    },
  );

  test('publishes the same Roles, rarities, deploy steps and Gauge roles as the app', () => {
    const schema = v.parse(ENUMS, readDoc('feed-page.schema.json'));
    const event = schema.$defs.event.properties;

    expect(event.archetype.oneOf[0].enum).toEqual(ARCHETYPES);
    expect(event.rarity.enum).toEqual(RARITIES);
    expect(event.step.enum).toEqual(DEPLOY_STEPS);
    expect(event.gauge.properties.role.enum).toEqual(GAUGE_ROLES);
  });
});
