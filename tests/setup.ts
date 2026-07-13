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
  // NB: patch jsdom's own `window.EventTarget.prototype` (the global `EventTarget` is a
  // different Node constructor) AND `window`/`document`, which own their own
  // `addEventListener` that shadows the prototype.
  // Wrap a target's OWN addEventListener (window/document have their own impl that a
  // prototype method can't stand in for — hence per-target capture).
  const wrapAddEventListener = (target: EventTarget): void => {
    const original = target.addEventListener;
    if (typeof original !== 'function') {
      return;
    }
    target.addEventListener = function addEventListener(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ): void {
      try {
        original.call(this, type, listener, options);
      } catch (error) {
        if (options && typeof options === 'object' && 'signal' in options) {
          const { signal: _signal, ...rest } = options;
          original.call(this, type, listener, rest);
        } else {
          throw error;
        }
      }
    };
  };

  wrapAddEventListener(window.EventTarget.prototype);
  for (const target of [window, document] as EventTarget[]) {
    if (Object.prototype.hasOwnProperty.call(target, 'addEventListener')) {
      wrapAddEventListener(target);
    }
  }
}
