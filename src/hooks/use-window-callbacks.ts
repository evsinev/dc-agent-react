import useSWR from 'swr';

type Callback = () => unknown;

declare global {
  interface Window {
    callbacks?: Record<string, Callback>;
  }
}

const TIMEOUT = 5000;

function timeout(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Время выполнения истекло'));
    }, TIMEOUT);
  });
}

async function runWithTimeout<T>(asyncFunc: (callback: Callback) => Promise<T>, callback: Callback): Promise<T> {
  return Promise.race([timeout(), asyncFunc(callback)]);
}

async function myAsyncFunction(callback: Callback): Promise<unknown> {
  // Создаем Promise, попадет в микротаски в EventLoop
  return new Promise((resolve) => {
    setTimeout(() => {
      // запускаем функцию в микротасках в EventLoop, не блокируя основной поток
      resolve(callback());
    }, 100);
  });
}

type Result = Record<string, { data: unknown; isLoading: boolean; error: unknown }>;

export function useWindowCallbacks() {
  const result: Result = {};

  Object.entries(window.callbacks || []).map(([key, callback]) => {
    const cb = () => runWithTimeout(myAsyncFunction, callback);

    const { data, isLoading, error } = useSWR(key, cb);
    result[key] = { data, isLoading, error };
  });

  return result;
}
