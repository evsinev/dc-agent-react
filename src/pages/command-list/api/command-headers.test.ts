import { describe, expect, test } from '@rstest/core';
import { headerNames, parseStoredHeaders } from './command-headers';

describe('stored headers', () => {
  test('a detail carries the stored object as JSON text', () => {
    expect(parseStoredHeaders('{"Authorization":"Bearer t","X-Tag":" a "}')).toEqual([
      { name: 'Authorization', value: 'Bearer t' },
      { name: 'X-Tag', value: ' a ' },
    ]);
    expect(parseStoredHeaders(undefined)).toEqual([]);
    expect(parseStoredHeaders('')).toEqual([]);
  });

  test('anything else does not parse', () => {
    for (const raw of ['Authorization, X-Trace', '[]', 'null', '{"a":1}', '{broken']) {
      expect(parseStoredHeaders(raw)).toBeNull();
    }
  });

  test('display shows names only, never a value', () => {
    expect(headerNames('{"Authorization":"Bearer SECRET","X-Trace":"on"}')).toBe('Authorization, X-Trace');
    // not a JSON object: hidden whatever it looks like — it may be the secret itself
    expect(headerNames('Authorization, X-Trace')).toMatch(/^\(hidden/);
    expect(headerNames('tok_SUPERSECRET')).toMatch(/^\(hidden/);
    expect(headerNames('{}')).toBe('—');
    expect(headerNames(undefined)).toBe('—');
    expect(headerNames('Bearer SECRET')).not.toContain('SECRET');
    expect(headerNames('{"a":1, SECRET')).not.toContain('SECRET');
  });
});
