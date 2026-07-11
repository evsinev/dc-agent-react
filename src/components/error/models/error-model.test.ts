import { describe, expect, rstest, test } from '@rstest/core';

// Keep the logger (pino) out of the test bundle — the model calls it in its constructor.
rstest.mock('@/libs/logger', () => ({ default: () => {} }));

import { RequestError } from './error-model';

describe('RequestError', () => {
  test('uses the provided errorId and fields', () => {
    const err = new RequestError({ title: 'Boom', errorId: 'abc', type: 'Custom', status: 500 });
    expect(err).toBeInstanceOf(Error);
    expect(err.errorCorrelationId).toBe('abc');
    expect(err.title).toBe('Boom');
    expect(err.message).toBe('Boom');
    expect(err.type).toBe('Custom');
    expect(err.status).toBe(500);
  });

  test('defaults type and auto-generates a correlation id', () => {
    const a = new RequestError({ title: 'A' });
    const b = new RequestError({ title: 'B' });
    expect(a.type).toBe('Request Error');
    expect(a.errorCorrelationId).toBeTruthy();
    expect(a.errorCorrelationId).not.toBe(b.errorCorrelationId);
  });
});
