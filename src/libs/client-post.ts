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

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
    },
    body: props.params ? JSON.stringify(props.params) : '{}',
  });

  if (!response.ok) {
    const errorMessage = await getFetchData<RequestErrorModel>(response);
    throw new RequestError(errorMessage);
  }

  return getFetchData<T>(response);
}
