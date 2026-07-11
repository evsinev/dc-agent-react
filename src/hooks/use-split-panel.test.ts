import { beforeEach, describe, expect, test } from '@rstest/core';
import { useSplitPanel } from './use-split-panel';

describe('useSplitPanel store', () => {
  beforeEach(() => {
    useSplitPanel.setState({ panel: undefined });
  });

  test('starts with no panel', () => {
    expect(useSplitPanel.getState().panel).toBeUndefined();
  });

  test('show() sets the panel, hide() clears it', () => {
    useSplitPanel.getState().show({ title: 'Details', content: 'body' });
    expect(useSplitPanel.getState().panel).toEqual({ title: 'Details', content: 'body' });

    useSplitPanel.getState().hide();
    expect(useSplitPanel.getState().panel).toBeUndefined();
  });

  test('last show() wins', () => {
    useSplitPanel.getState().show({ title: 'first', content: 'a' });
    useSplitPanel.getState().show({ title: 'second', content: 'b' });
    expect(useSplitPanel.getState().panel?.title).toBe('second');
  });
});
