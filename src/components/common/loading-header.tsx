import { Header, StatusIndicator } from '@cloudscape-design/components';
import { ReactNode } from 'react';

export type LoadingHeaderParams = {
  description: string;
  children?: ReactNode;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  actions?: ReactNode;
};

function getInfo({ isPending, isFetching, isError }: LoadingHeaderParams) {
  if (isError) {
    return <StatusIndicator type="error">Error</StatusIndicator>;
  }

  if (isPending) {
    return <StatusIndicator type="pending">Pending ...</StatusIndicator>;
  }

  if (isFetching) {
    return <StatusIndicator type="loading">Fetching ...</StatusIndicator>;
  }

  return <span />;
}

export function LoadingHeader(params: LoadingHeaderParams) {
  return (
    <Header
      info={getInfo(params)}
      description={params.description}
      actions={params.actions}
    >
      {params.children}
    </Header>
  );
}
