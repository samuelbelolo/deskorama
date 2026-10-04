import { LANGUAGES } from '@deskorama/core';
import { expect, test } from 'vitest';
import { FICTIONAL_GAUGES, FICTIONAL_SOURCE } from '../src/fictional-source.ts';

test('the fictional Source labels every Gauge in every display language, and starts within its crowd', () => {
  for (const role of ['crowd', 'daily', 'total'] as const) {
    for (const lang of LANGUAGES) {
      const { label, short } = FICTIONAL_SOURCE.gauges[role].text[lang];
      expect(label, `${role} ${lang}`).not.toBe('');
      expect(short, `${role} ${lang}`).not.toBe('');
    }
  }
  expect(FICTIONAL_GAUGES.crowd).toBeLessThanOrEqual(FICTIONAL_SOURCE.gauges.crowd.max);
});
