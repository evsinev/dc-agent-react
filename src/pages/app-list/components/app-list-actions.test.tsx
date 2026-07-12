import { describe, expect, rstest, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import AppListActions from './app-list-actions';

const noop = () => {};

describe('AppListActions', () => {
  test('renders the pull button and the git status hint', () => {
    render(
      <AppListActions
        branch="sandbox-main"
        updatedLabel="2 hours ago"
        isPulling={false}
        onPull={noop}
        onRefresh={noop}
      />,
    );

    expect(screen.getByRole('button', { name: 'Pull from Git' })).toBeTruthy();
    expect(screen.getByText(/sandbox-main · updated 2 hours ago/)).toBeTruthy();
  });

  test('invokes onPull and onRefresh on click', () => {
    const onPull = rstest.fn();
    const onRefresh = rstest.fn();
    render(
      <AppListActions
        branch="sandbox-main"
        updatedLabel="x"
        isPulling={false}
        onPull={onPull}
        onRefresh={onRefresh}
      />,
    );

    screen.getByRole('button', { name: 'Pull from Git' }).click();
    screen.getByRole('button', { name: 'Refresh list' }).click();

    expect(onPull).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test('shows the loading label while pulling', () => {
    render(
      <AppListActions
        branch="sandbox-main"
        updatedLabel="x"
        isPulling={true}
        onPull={noop}
        onRefresh={noop}
      />,
    );

    expect(screen.getByText('Pulling')).toBeTruthy();
  });
});
