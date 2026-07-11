import { describe, expect, test } from '@rstest/core';
import { parsePropertyFilterQuery } from './parse-property-filter';

describe('parsePropertyFilterQuery', () => {
  test('returns the default query for an empty string', () => {
    expect(parsePropertyFilterQuery('')).toEqual({ operation: 'and', tokens: [] });
  });

  test('returns the default query for malformed input', () => {
    expect(parsePropertyFilterQuery('not-json')).toEqual({ operation: 'and', tokens: [] });
  });

  test('parses a valid stringified query', () => {
    const query = {
      operation: 'or',
      tokens: [{ propertyKey: 'host', operator: '=', value: 'sandbox-1' }],
    };
    expect(parsePropertyFilterQuery(JSON.stringify(query))).toEqual(query);
  });
});
