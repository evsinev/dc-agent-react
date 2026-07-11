import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import Label from './label';

test('renders the label text and its children', () => {
  render(<Label label="Host">sandbox-1</Label>);
  expect(screen.getByText('Host')).toBeTruthy();
  expect(screen.getByText('sandbox-1')).toBeTruthy();
});
