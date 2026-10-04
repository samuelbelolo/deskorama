import { expect, test } from 'vitest';
import { testCommand } from '../src/main/test-command.ts';

test('the test command posts a celebration to the loopback address with the secret, in the display language', () => {
  const command = testCommand(47_213, 'drawn-secret-for-this-launch', 'fr');
  expect(command).toMatch(/^curl http:\/\/127\.0\.0\.1:47213\/events /);
  expect(command).toContain(`-H 'Authorization: Bearer drawn-secret-for-this-launch'`);
  const body = JSON.parse(/-d '(.*)'$/.exec(command)?.[1] ?? 'null');
  expect(body).toMatchObject({ archetype: 'celebration', source: 'Terminal' });
  expect(Object.keys(body.text)).toEqual(['fr']);
});
