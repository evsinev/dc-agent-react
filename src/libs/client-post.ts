import { RequestError } from '@/components/error/models/error-model';
import { RequestErrorModel } from '@/components/error/models/types';

interface ClientPostProps {
  url: string;
  params?: object;
  options?: {
    proxy: boolean;
  };
}

const getFetchData = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) {
    throw new RequestError({
      title: 'Empty response',
      type: 'Request error',
      status: response.status,
      detail: {
        path: response.url,
      },
    });
  }
  try {
    return JSON.parse(text) as T;
  } catch (_e) {
    return text as T;
  }
};

export async function clientPost<T>(props: ClientPostProps): Promise<T> {
  const url = process.env.PUBLIC_API_BASE_URL + props.url;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
      },
      body: props.params ? JSON.stringify(props.params) : '{}',
    });
  } catch (_cause) {
    // fetch rejects (backend down, DNS, CORS, offline) with a native TypeError that carries
    // no human-readable fields — wrap it so callers get an actionable message, not a blank error.
    throw new RequestError({
      title: 'Could not connect to the server',
      type: 'NetworkError',
      detail: {
        path: props.url,
        params: props.params,
        method: 'POST',
      },
    });
  }

  if (!response.ok) {
    const errorMessage = await getFetchData<RequestErrorModel>(response);
    throw new RequestError({
      // biome-ignore lint/suspicious/noExplicitAny: <explanation> TODO: привести ошибки на бэкенде к общему формату
      errorId: errorMessage.errorId || (errorMessage as any).errorCorrelationId,
      title: 'Request Error',
      status: response.status,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation> TODO: привести ошибки на бэкенде к общему формату
      type: errorMessage.type || (errorMessage as any).errorMessage,
      detail: {
        path: props.url,
        params: props.params,
        method: 'POST',
      },
    });
  }

  return getFetchData<T>(response);
}
