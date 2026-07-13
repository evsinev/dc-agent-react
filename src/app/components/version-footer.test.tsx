import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { VersionFooterView } from './version-footer';

describe('VersionFooterView', () => {
  test('renders the frontend and backend versions', () => {
    render(
      <VersionFooterView
        frontend="1.2.3 (abc1234)"
        backend="1.0-SNAPSHOT"
      />,
    );

    expect(screen.getByText('frontend')).toBeTruthy();
    expect(screen.getByText('1.2.3 (abc1234)')).toBeTruthy();
    expect(screen.getByText('backend')).toBeTruthy();
    expect(screen.getByText('1.0-SNAPSHOT')).toBeTruthy();
  });
});
