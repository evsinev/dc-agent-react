import { RequestError } from '@/components/error/models/error-model';
import { Alert, Button } from '@cloudscape-design/components';
import { ReactNode } from 'react';

/**
 * Human, actionable message for a failed request — never a raw machine dump
 * (Cloudscape: "Don't display raw machine-generated errors as the primary message").
 */
export function errorMessage(error: unknown): string {
  if (error instanceof RequestError) {
    const status = error.status ? ` (HTTP ${error.status})` : '';
    return `${error.title ?? 'Request failed'}${status}.`;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong.';
}

type Props = {
  error: unknown;
  onRetry: () => void;
  /** What failed to load, e.g. "applications" — used in the header. */
  resource?: string;
  children?: ReactNode;
};

/**
 * In-content error state for a failed data load: a Cloudscape error Alert with a Retry
 * action. Use it in a table's `empty` slot or at the top of a detail view — per the
 * Cloudscape table-view pattern (load failures go in-content, not in a flashbar).
 */
export default function LoadError({ error, onRetry, resource, children }: Props) {
  return (
    <Alert
      type="error"
      header={`Failed to load ${resource ?? 'data'}`}
      action={<Button onClick={onRetry}>Retry</Button>}
    >
      {children ?? errorMessage(error)}
    </Alert>
  );
}
