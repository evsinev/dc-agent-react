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
        params: redactSecrets(props.params),
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
        params: redactSecrets(props.params),
        method: 'POST',
      },
    });
  }

  return getFetchData<T>(response);
}

const REDACTED = '***';

/**
 * A copy of request params safe for `RequestError.detail` — which is logged as soon as the error is
 * created: new api keys (`apiKeys.add[].key`) and header values of a command config
 * (`config.reloadHeaders`, a service token) are replaced. The request itself is sent unchanged.
 */
export function redactSecrets(params: unknown): unknown {
  if (params === null || typeof params !== 'object' || Array.isArray(params)) {
    return params;
  }
  const copy: Record<string, unknown> = { ...(params as Record<string, unknown>) };
  const apiKeys = copy.apiKeys as { add?: unknown } | undefined;
  if (apiKeys && typeof apiKeys === 'object' && Array.isArray(apiKeys.add)) {
    copy.apiKeys = {
      ...apiKeys,
      add: apiKeys.add.map((entry) =>
        entry && typeof entry === 'object' ? { ...(entry as object), key: REDACTED } : REDACTED,
      ),
    };
  }
  const config = copy.config as { reloadHeaders?: unknown } | undefined;
  if (config && typeof config === 'object' && config.reloadHeaders && typeof config.reloadHeaders === 'object') {
    copy.config = {
      ...config,
      reloadHeaders: Object.fromEntries(Object.keys(config.reloadHeaders as object).map((name) => [name, REDACTED])),
    };
  }
  return copy;
}
