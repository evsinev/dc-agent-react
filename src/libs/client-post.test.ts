import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';

rstest.mock('@/libs/logger', () => ({ default: () => {} }));

import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from './client-post';

type FakeResponse = {
  ok: boolean;
  status: number;
  url: string;
  text: () => Promise<string>;
};

const originalFetch = globalThis.fetch;

function stubFetch(res: FakeResponse) {
  globalThis.fetch = (() => Promise.resolve(res as unknown as Response)) as typeof fetch;
}

describe('clientPost', () => {
  beforeEach(() => {
    stubFetch({ ok: true, status: 200, url: '/x', text: () => Promise.resolve('') });
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('parses a JSON response', async () => {
    stubFetch({ ok: true, status: 200, url: '/x', text: () => Promise.resolve('{"appName":"hello-world"}') });
    await expect(clientPost({ url: '/app/view/hello-world' })).resolves.toEqual({ appName: 'hello-world' });
  });

  test('returns raw text when the body is not JSON', async () => {
    stubFetch({ ok: true, status: 200, url: '/x', text: () => Promise.resolve('plain text') });
    await expect(clientPost({ url: '/x' })).resolves.toBe('plain text');
  });

  test('throws on an empty body', async () => {
    stubFetch({ ok: true, status: 200, url: '/x', text: () => Promise.resolve('') });
    await expect(clientPost({ url: '/x' })).rejects.toThrow('Empty response');
  });

  test('throws a RequestError carrying the status on a non-OK response', async () => {
    stubFetch({ ok: false, status: 500, url: '/x', text: () => Promise.resolve('{"type":"Boom"}') });
    const error = await clientPost({ url: '/x' }).then(
      () => null,
      (e) => e,
    );
    expect(error).toBeInstanceOf(RequestError);
    expect((error as RequestError).status).toBe(500);
  });
});
