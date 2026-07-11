import { beforeEach, describe, expect, test } from '@rstest/core';
import { useHelpPanel } from './use-help-panel';

describe('useHelpPanel store', () => {
  beforeEach(() => {
    useHelpPanel.setState({ panel: undefined });
  });

  test('starts with no panel', () => {
    expect(useHelpPanel.getState().panel).toBeUndefined();
  });

  test('show() sets the panel, hide() clears it', () => {
    useHelpPanel.getState().show({ title: 'Help', content: 'text' });
    expect(useHelpPanel.getState().panel).toEqual({ title: 'Help', content: 'text' });

    useHelpPanel.getState().hide();
    expect(useHelpPanel.getState().panel).toBeUndefined();
  });
});
