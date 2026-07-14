import type { AppListItem } from '@/pages/app-list/api/app-list';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import AppListTable from './app-list-table';

// AppStatusIndicator fetches per-row status over the network; stub it out so the table renders offline.
rstest.mock('@/pages/app-list/components/app-status-indicator', () => ({
  AppStatusIndicator: () => null,
}));

const noop = () => {};

// 100 apps + default pageSize 30 => 4 pages. app-061 is the first row of page 3.
const apps: AppListItem[] = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, '0');
  return { appName: `app-${n}`, taskName: `task-${n}`, taskHost: `host-${n}`, taskType: 'docker' };
});

function renderTable() {
  return render(
    <BrowserRouter>
      <AppListTable
        apps={apps}
        isLoading={false}
        selected={[]}
        setSelected={noop}
        onRetry={noop}
      />
    </BrowserRouter>,
  );
}

describe('AppListTable pagination persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  test('writes the current page to the URL and restores it after a remount', () => {
    renderTable();

    // Page 1: first items visible, page-3 items not.
    expect(screen.queryByText('app-001')).toBeTruthy();
    expect(screen.queryByText('app-061')).toBeNull();

    // Go to page 3.
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(window.location.search).toContain('page=3');
    expect(screen.queryByText('app-061')).toBeTruthy();
    expect(screen.queryByText('app-001')).toBeNull();

    // Remounting fresh (as after navigating away and back) restores page 3 from the URL.
    cleanup();
    renderTable();

    expect(screen.queryByText('app-061')).toBeTruthy();
    expect(screen.queryByText('app-001')).toBeNull();
  });
});
