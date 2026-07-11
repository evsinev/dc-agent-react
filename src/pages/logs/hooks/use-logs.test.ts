import { beforeEach, describe, expect, test } from '@rstest/core';
import useLogs from './use-logs';

describe('useLogs store', () => {
  beforeEach(() => {
    useLogs.setState({ logToken: undefined, logs: [] });
  });

  test('starts empty', () => {
    expect(useLogs.getState().logToken).toBeUndefined();
    expect(useLogs.getState().logs).toEqual([]);
  });

  test('setLogToken stores the token', () => {
    useLogs.getState().setLogToken('token-1');
    expect(useLogs.getState().logToken).toBe('token-1');
  });

  test('setLogs appends to existing logs', () => {
    useLogs.getState().setLogs(['a', 'b']);
    useLogs.getState().setLogs(['c']);
    expect(useLogs.getState().logs).toEqual(['a', 'b', 'c']);
  });

  test('caps the buffer when it grows past 10000 entries', () => {
    useLogs.getState().setLogs(Array.from({ length: 10_001 }, (_, i) => `log ${i}`));
    // Implementation splices from index 10 when over the limit, keeping the first 10.
    expect(useLogs.getState().logs).toHaveLength(10);
  });
});
