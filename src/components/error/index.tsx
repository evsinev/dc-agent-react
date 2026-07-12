import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * Global SWR configuration. Load failures are surfaced in-content by each page (a
 * `<LoadError>` with Retry), and action failures via the notifications flashbar
 * (`use-notifications`) — so there is no global error-to-flashbar handler here.
 * `RequestError` still logs every failure (see its constructor). Retry is manual
 * because auto-retry is disabled.
 */
export default function ErrorProvider(props: ErrorProviderProps) {
  return <SWRConfig value={{ shouldRetryOnError: false }}>{props.children}</SWRConfig>;
}
