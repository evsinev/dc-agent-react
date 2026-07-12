import { useState } from 'react';

/**
 * Like useState, but persisted to localStorage under `key`.
 * Used to remember table preferences (page size, visible columns, ...) across reloads.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!raw) {
      return initialValue;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (_error) {
      return initialValue;
    }
  });

  const setStoredValue = (next: T) => {
    setValue(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  };

  return [value, setStoredValue] as const;
}
