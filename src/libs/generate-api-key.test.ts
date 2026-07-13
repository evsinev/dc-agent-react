import { describe, expect, test } from '@rstest/core';
import { API_KEY_LENGTH, generateApiKey } from './generate-api-key';

describe('generateApiKey', () => {
  test('returns a 48-character key from [A-Za-z0-9_] by default', () => {
    const key = generateApiKey();
    expect(key).toHaveLength(API_KEY_LENGTH);
    expect(/^[A-Za-z0-9_]+$/.test(key)).toBe(true);
  });

  test('honours a custom length', () => {
    expect(generateApiKey(12)).toHaveLength(12);
    expect(generateApiKey(1)).toHaveLength(1);
  });

  test('produces distinct keys on successive calls', () => {
    expect(generateApiKey()).not.toBe(generateApiKey());
  });
});
