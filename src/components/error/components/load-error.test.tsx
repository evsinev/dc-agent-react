import { describe, expect, rstest, test } from '@rstest/core';

rstest.mock('@/libs/logger', () => ({ default: () => {} }));

import { RequestError } from '@/components/error/models/error-model';
import { render, screen } from '@testing-library/react';
import LoadError, { errorMessage } from './load-error';

describe('errorMessage', () => {
  test('uses the RequestError title for a network error', () => {
    const error = new RequestError({ title: 'Could not connect to the server', type: 'NetworkError' });
    expect(errorMessage(error)).toBe('Could not connect to the server.');
  });

  test('includes the HTTP status when present', () => {
    const error = new RequestError({ title: 'Request Error', status: 500 });
    expect(errorMessage(error)).toBe('Request Error (HTTP 500).');
  });

  test('falls back to a plain message for a native error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  test('has a safe default for unknown values', () => {
    expect(errorMessage(undefined)).toBe('Something went wrong.');
  });
});

describe('LoadError', () => {
  test('renders the header, message, and a Retry button that calls onRetry', () => {
    const onRetry = rstest.fn();
    const error = new RequestError({ title: 'Could not connect to the server', type: 'NetworkError' });

    render(
      <LoadError
        error={error}
        onRetry={onRetry}
        resource="commands"
      />,
    );

    expect(screen.getByText('Failed to load commands')).toBeTruthy();
    expect(screen.getByText('Could not connect to the server.')).toBeTruthy();

    screen.getByRole('button', { name: 'Retry' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
