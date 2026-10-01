import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';

const logged: unknown[] = [];
rstest.mock('@/libs/logger', () => ({ default: (entry: unknown) => logged.push(entry) }));

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

  test('wraps a network failure (fetch rejects) in a RequestError with a real message', async () => {
    globalThis.fetch = (() => Promise.reject(new TypeError('Failed to fetch'))) as typeof fetch;
    const error = await clientPost({ url: '/x' }).then(
      () => null,
      (e) => e,
    );
    expect(error).toBeInstanceOf(RequestError);
    expect((error as RequestError).title).toBe('Could not connect to the server');
    expect((error as RequestError).type).toBe('NetworkError');
  });
});

describe('secrets never reach the error or its log', () => {
  const params = {
    host: 'h1',
    name: 'bundle',
    config: { dir: '/opt/b', reloadHeaders: { Authorization: 'Bearer SERVICESECRET' } },
    apiKeys: { keep: ['****abcd'], add: [{ key: 'NEWAPIKEYSECRET', owner: 'ci' }] },
  };

  afterEach(() => {
    globalThis.fetch = originalFetch;
    logged.length = 0;
  });

  test('a 400 keeps the operator text and masks the payload', async () => {
    let sent = '';
    globalThis.fetch = ((_url: string, init: RequestInit) => {
      sent = String(init.body);
      return Promise.resolve({
        ok: false,
        status: 400,
        url: '/x',
        text: () =>
          Promise.resolve(
            '{"errorCorrelationId":"e1","errorMessage":"config bundle: field waitTimeout: bad","httpReasonCode":400}',
          ),
      } as unknown as Response);
    }) as typeof fetch;

    const error = (await clientPost({ url: '/command/create/zip-archive-version', params }).then(
      () => null,
      (e) => e,
    )) as RequestError;

    // the request itself is unchanged
    expect(JSON.parse(sent)).toEqual(params);
    expect(error.type).toBe('config bundle: field waitTimeout: bad');
    expect(JSON.stringify(error.detail)).not.toMatch(/SERVICESECRET|NEWAPIKEYSECRET/);
    expect(JSON.stringify(error.detail)).toContain('Authorization');
    expect(logged.length).toBeGreaterThan(0);
    expect(JSON.stringify(logged)).not.toMatch(/SERVICESECRET|NEWAPIKEYSECRET/);
  });

  test('a network failure masks the payload too', async () => {
    globalThis.fetch = (() => Promise.reject(new TypeError('Failed to fetch'))) as typeof fetch;

    const error = (await clientPost({ url: '/command/update/zip-archive-version', params }).then(
      () => null,
      (e) => e,
    )) as RequestError;

    expect(JSON.stringify(error.detail)).not.toMatch(/SERVICESECRET|NEWAPIKEYSECRET/);
    expect(JSON.stringify(logged)).not.toMatch(/SERVICESECRET|NEWAPIKEYSECRET/);
  });
});
