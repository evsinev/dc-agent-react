import Header from '@cloudscape-design/components/header';
import useSWR from 'swr';

declare global {
  interface Window {
    callbacks?: Record<string, () => unknown>;
  }
}

async function myAsyncFunction(syncFunc: () => unknown): Promise<unknown> {
  // Создаем Promise, попадет в микротаски в EventLoop
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(syncFunc());
    }, 1000);
  });

  // Приостанавливаем выполнение функции до разрешения Promise
  // Продолжаем выполнение после разрешения Promise
  return promise;
}

export default function TestPage() {
  // Создаем массив хуков
  const fetchers = Object.entries(window.callbacks || []).map(([key, callback]) => {
    const { data, isLoading, error } = useSWR(key, () => myAsyncFunction(callback));

    return { [key]: { data, isLoading, error } };
  });

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('fetchers', fetchers);

  return (
    <div>
      <Header variant="h1">Test Page</Header>
    </div>
  );
}
