import { afterEach, describe, expect, rstest, test } from '@rstest/core';

rstest.mock('@/libs/logger', () => ({ default: () => {} }));

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { SWRConfig } from 'swr';
import CommandEdit from '../command-edit';
import CommandCreate from './index';

// The operator's answer to a refused config: CommandSaveStatus.INVALID → 400 with the agent's text.
const REFUSAL = 'config bundle: field waitTimeout: expected a duration like 30s or 5m';
const OPERATOR_400 = JSON.stringify({ errorCorrelationId: 'e1', errorMessage: REFUSAL, httpReasonCode: 400 });

const DETAIL = {
  command: {
    host: 'sandbox-1',
    name: 'bundle',
    type: 'ZIP_ARCHIVE_VERSION',
    parameters: {
      dir: '/opt/app/bundles',
      versionFile: '/opt/app/bundles/current',
      reloadUrl: 'http://127.0.0.1:8080/reload?version=${version}',
      waitTimeout: '5m',
    },
    apiKeys: [{ maskedId: '****abcd', owner: 'ci' }],
  },
};

const originalFetch = globalThis.fetch;

function stubOperator(): void {
  globalThis.fetch = ((url: string) => {
    const respond = (status: number, body: unknown) =>
      Promise.resolve({
        ok: status < 400,
        status,
        url,
        text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
      } as unknown as Response);
    if (url.endsWith('/agent/list')) {
      return respond(200, { agents: [{ name: 'sandbox-1', url: 'http://sandbox-1:8051/dc-agent' }] });
    }
    if (url.endsWith('/command/get')) {
      return respond(200, DETAIL);
    }
    if (url.includes('/command/create/zip-archive-version') || url.includes('/command/update/zip-archive-version')) {
      return respond(400, OPERATOR_400);
    }
    return respond(404, { errorMessage: `unexpected ${url}` });
  }) as typeof fetch;
}

function renderAt(path: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/commands/create"
            element={<CommandCreate />}
          />
          <Route
            path="/commands/:host/:name/edit"
            element={<CommandEdit />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>,
  );
}

function fill(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
}

describe('a refused config shows the operator text in the form', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('create', async () => {
    stubOperator();
    renderAt('/commands/create?agent=sandbox-1');

    fireEvent.click(screen.getByText('zip-archive-version'));
    fill('Name', 'bundle');
    fill('dir', '/opt/app/bundles');
    fill('versionFile', '/opt/app/bundles/current');
    fill('reloadUrl', 'http://127.0.0.1:8080/reload');
    fireEvent.click(screen.getByRole('button', { name: 'Create command' }));

    expect((await screen.findAllByText(REFUSAL)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Request Error \(HTTP 400\)/)).toBeNull();
  });

  test('edit', async () => {
    stubOperator();
    renderAt('/commands/sandbox-1/bundle/edit');

    fireEvent.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect((await screen.findAllByText(REFUSAL)).length).toBeGreaterThan(0);
  });
});
