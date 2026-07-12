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

  // The newer Cloudscape component-toolkit registers listeners with an AbortSignal
  // ({ signal }). jsdom rejects a signal created outside its own realm, throwing a
  // TypeError on render. Fall back to registering without the signal only when that
  // happens — valid registrations are untouched, and React unmount still cleans up.
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function addEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    try {
      originalAddEventListener.call(this, type, listener, options);
    } catch (error) {
      if (options && typeof options === 'object' && 'signal' in options) {
        const rest: AddEventListenerOptions = { ...options, signal: undefined };
        originalAddEventListener.call(this, type, listener, rest);
      } else {
        throw error;
      }
    }
  };
}
