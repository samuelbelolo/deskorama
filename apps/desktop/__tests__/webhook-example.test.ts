import { LANGUAGES } from '@deskorama/core';
import { validatePostedEvent } from '@deskorama/event-json';
import { expect, test } from 'vitest';
import { webhookAddress } from '../src/main/webhook-address.ts';
import { webhookExample } from '../src/main/webhook-example.ts';

test.for(LANGUAGES)('the example is one line of curl whose body is a valid Event, in %s', async (lang) => {
  const example = webhookExample(webhookAddress(47_213), null, lang);

  expect(example).not.toContain('\n');
  expect(example).toMatch(/^curl http:\/\/127\.0\.0\.1:47213\/events -H "Authorization: Bearer \$DESKORAMA_SECRET" /);
  expect(example).toContain('-H "Content-Type: application/json"');

  const body: unknown = JSON.parse(/-d '(.*)'$/.exec(example)?.[1] ?? 'null');
  const validation = await validatePostedEvent(body);

  expect(validation).toMatchObject({ ok: true, event: { archetype: 'approval', source: 'Mac' } });
  expect(validation.ok ? Object.keys(validation.event.text) : []).toEqual([lang]);
});

test('the example copied carries the real secret, which a shell leaves as it is', () => {
  const example = webhookExample(webhookAddress(47_213), 'q7Zt_-fictional-secret-0001', 'en');

  expect(example).toContain("-H 'Authorization: Bearer q7Zt_-fictional-secret-0001'");
  expect(example).not.toContain('$DESKORAMA_SECRET');
});

test('a secret fixed from outside the app is copied so that a shell expands and runs nothing in it', () => {
  const example = webhookExample(webhookAddress(47_213), 'a$HOME`id`"b"\'c', 'en');

  // In single quotes a shell reads every character as it is; the secret's own single quote is the one escape.
  expect(example).toContain(`-H 'Authorization: Bearer a$HOME\`id\`"b"'\\''c' -H "Content-Type`);
  expect(example).not.toContain('"Authorization: Bearer');
});
