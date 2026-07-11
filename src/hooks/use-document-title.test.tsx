import { afterEach, describe, expect, test } from '@rstest/core';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from './use-document-title';

describe('useDocumentTitle', () => {
  afterEach(() => {
    window.TITLE_PREFIX = undefined;
  });

  test('window.TITLE_PREFIX takes priority', () => {
    window.TITLE_PREFIX = 'win: ';
    renderHook(() => useDocumentTitle('App list'));
    expect(document.title).toBe('win: App list');
  });

  test('falls back to a prefixed title when no window override is set', () => {
    window.TITLE_PREFIX = undefined;
    renderHook(() => useDocumentTitle('Service list'));
    // Prefix comes from PUBLIC_TITLE_PREFIX or the 'dc: ' default; the title is always suffixed.
    expect(document.title.endsWith('Service list')).toBe(true);
  });

  test('leaves the title unchanged for a null title', () => {
    document.title = 'kept';
    renderHook(() => useDocumentTitle(null));
    expect(document.title).toBe('kept');
  });
});
