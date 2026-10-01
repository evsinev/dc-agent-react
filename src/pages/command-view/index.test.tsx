import { describe, expect, rstest, test } from '@rstest/core';

rstest.mock('@/libs/logger', () => ({ default: () => {} }));
rstest.mock('@/pages/command-list/api/command-mutations', () => ({
  useCommandGet: () => ({
    data: {
      host: 'sandbox-1',
      name: 'bundle',
      type: 'ZIP_ARCHIVE_VERSION',
      parameters: {
        dir: '/opt/app/bundles',
        versionFile: '/opt/app/bundles/current',
        reloadUrl: 'http://127.0.0.1:8080/reload?version=${version}',
        reloadHeaders: '{"Authorization":"Bearer SERVICESECRET","X-Trace":"on"}',
      },
      apiKeys: [{ maskedId: '****abcd', owner: 'ci' }],
    },
    isLoading: false,
    error: undefined,
    mutate: () => {},
  }),
}));
rstest.mock('@/pages/dc-agent-list/api/agent-list', () => ({
  useAgentList: () => ({ data: { agents: [{ name: 'sandbox-1', url: 'http://sandbox-1:8051/dc-agent' }] } }),
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import CommandView from './index';

describe('CommandView (zip-archive-version)', () => {
  test('shows the header names and never their values', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/commands/sandbox-1/bundle']}>
        <Routes>
          <Route
            path="/commands/:host/:name"
            element={<CommandView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Authorization, X-Trace')).toBeTruthy();
    expect(screen.getByText('/opt/app/bundles/current')).toBeTruthy();
    expect(container.innerHTML).not.toContain('SERVICESECRET');
    // the Usage snippet keeps the failure body and the {version} placeholder
    expect(container.textContent).toContain('--fail-with-body');
    expect(container.textContent).toContain('/dc-agent/zip-archive-version/bundle/{version}');
    expect(screen.getByText(/Replace package.zip, \$DEPLOY_KEY and \{version\}/)).toBeTruthy();
  });
});
