import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import DefinitionList, { calculateColumnCount } from './index';

describe('calculateColumnCount', () => {
  test('falls back to the requested columns when the width is unknown', () => {
    expect(calculateColumnCount(3, 150, null)).toBe(3);
  });

  test('fits as many columns as minColumnWidth allows', () => {
    expect(calculateColumnCount(4, 150, 700)).toBe(4);
    expect(calculateColumnCount(2, 150, 700)).toBe(2);
  });

  test('keeps the column count even while wrapping into fewer columns', () => {
    // floor(500 / 150) = 3, which is fewer than requested and odd -> 2
    expect(calculateColumnCount(4, 150, 500)).toBe(2);
    // floor(700 / 200) = 3 -> 2
    expect(calculateColumnCount(4, 200, 700)).toBe(2);
  });

  test('never returns less than one column', () => {
    expect(calculateColumnCount(4, 150, 100)).toBe(1);
  });
});

describe('DefinitionList', () => {
  test('renders a definition list with label, leader and value', () => {
    const { container } = render(
      <DefinitionList
        ariaLabel="Agent details"
        items={[{ label: 'Media Type', value: 'SSD' }]}
      />,
    );
    const dl = container.querySelector('dl.definition-list');
    expect(dl?.getAttribute('aria-label')).toBe('Agent details');
    expect(container.querySelector('dt .definition-list__label')?.textContent).toBe('Media Type');
    expect(container.querySelector('dd')?.textContent).toBe('SSD');
    expect(container.querySelector('.definition-list__leader')).toBeTruthy();
  });

  test('renders group titles and nested pairs', () => {
    const { container } = render(
      <DefinitionList items={[{ type: 'group', title: 'Health', items: [{ label: 'State', value: 'ok' }] }]} />,
    );
    expect(container.querySelector('.definition-list__group-title')?.textContent).toBe('Health');
    expect(container.querySelector('.definition-list__group-list dd')?.textContent).toBe('ok');
  });

  test('caps the grid at four columns', () => {
    const { container } = render(
      <DefinitionList
        columns={9}
        items={[{ label: 'A', value: 'B' }]}
      />,
    );
    const dl = container.querySelector('dl.definition-list') as HTMLElement;
    expect(dl.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
  });

  test('applies termWidth as a CSS variable', () => {
    const { container } = render(
      <DefinitionList
        termWidth="140px"
        items={[{ label: 'A', value: 'B' }]}
      />,
    );
    const dl = container.querySelector('dl.definition-list') as HTMLElement;
    expect(dl.style.getPropertyValue('--definition-list-term-width')).toBe('140px');
  });
});
