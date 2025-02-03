import * as process from 'process';

import createError from '@/components/error/create-error';
import Error from '@/components/error/interface';

export interface PostResponse<T> {
  data?: T;
  status?: number;
  error?: Error;
}

interface ClientPostProps {
  url: string;
  params?: any;
}

const getFetchData = async <T>(response: Response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    const stringify = response.ok ? text : undefined;
    if (stringify) {
      return JSON.parse(stringify) as T;
    }
    return undefined;
  } catch (e) {
    return text as T;
  }
};

export async function clientPost<T>(props: ClientPostProps): Promise<PostResponse<T>> {
  const baseUrl = (window as any).API_BASE_URL ? (window as any).API_BASE_URL : process.env.PUBLIC_API_BASE_URL;
  const response = await fetch(baseUrl + props.url, {
    cache: 'no-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: props.params ? JSON.stringify(props.params) : '{}',
  });

  if (response.status === 403) {
    return { data: undefined, error: undefined, status: response?.status };
  }

  return {
    data: await getFetchData<T>(response),
    status: response.status,
    error: response.ok ? undefined : createError({
      title: `${props.url} request error`,
      type: 'Request error',
      status: response.status,
      detail: {
        path: props.url,
        params: props.params,
        method: 'POST',
      },
    }),
  };
}
