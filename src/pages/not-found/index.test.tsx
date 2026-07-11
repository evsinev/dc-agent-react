import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import NotFound from './index';

test('renders the not-found message', () => {
  render(<NotFound />);
  expect(screen.getByText('Not found')).toBeTruthy();
  expect(screen.getByText('Page not found')).toBeTruthy();
});
