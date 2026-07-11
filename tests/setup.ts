import { afterEach } from '@rstest/core';
import { cleanup } from '@testing-library/react';

// Unmount React trees rendered by @testing-library between tests.
afterEach(() => {
  cleanup();
});

// jsdom lacks these Web APIs that Cloudscape components touch on render — stub them.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
}
