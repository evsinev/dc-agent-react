import process from 'process';

type RemoteSendProps = {
  path: string;
  request?: any;
};

class ProblemError extends Error {
  constructor(message : string, cause? : Error) {
    super(message);
    this.cause = cause;
    this.name = 'ReadError';
  }
}

async function makeSuccessResponse<T>(response: Response) : Promise<T> {
  if (!response.ok) {
    throw new ProblemError('Response is not ok');
  }

  const text = await response.text();
  return JSON.parse(text) as T;
}

export async function remoteSend<T>(props: RemoteSendProps): Promise<T> {
  const url = process.env.PUBLIC_API_BASE_URL + props.path;
  console.log(`Sending to ${url}`, props.request);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: props.request ? JSON.stringify(props.request) : '{}',
    });

    console.log(`<< ${url} ${response.status}`);

    switch (response.status) {
      case 200:
        return await makeSuccessResponse(response);
      case 401:
        throw new ProblemError('Forbidden');
      case 403:
        throw new ProblemError('Unauthorized');
      default:
        throw new ProblemError(`Unknown error ${response.status}`);
    }
  } catch (e) {
    throw new ProblemError('Cannot fetch', e as Error);
  }
}
