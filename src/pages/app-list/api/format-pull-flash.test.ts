import { describe, expect, test } from '@rstest/core';
import { formatPullFlash } from './format-pull-flash';

describe('formatPullFlash', () => {
  test('summarizes multiple pulled commits as a success', () => {
    expect(formatPullFlash({ branch: 'main', newCount: 3, latestMessage: '[paynet-proc] Fixed csp url' })).toEqual({
      type: 'success',
      content: 'Pulled 3 new commits from main. Latest: [paynet-proc] Fixed csp url',
    });
  });

  test('uses the singular for a single commit', () => {
    expect(formatPullFlash({ branch: 'sandbox-main', newCount: 1, latestMessage: 'Wire up echo service' })).toEqual({
      type: 'success',
      content: 'Pulled 1 new commit from sandbox-main. Latest: Wire up echo service',
    });
  });

  test('omits the "Latest" suffix when no message is available', () => {
    expect(formatPullFlash({ branch: 'main', newCount: 2 })).toEqual({
      type: 'success',
      content: 'Pulled 2 new commits from main.',
    });
  });

  test('reports an already-up-to-date info message when nothing was pulled', () => {
    expect(formatPullFlash({ branch: 'main', newCount: 0 })).toEqual({
      type: 'info',
      content: 'Already up to date with main.',
    });
  });
});
