import { Header, StatusIndicator } from '@cloudscape-design/components';
import React from 'react';

export type LoadingHeaderParams = {
  description: string;
  children?: React.ReactNode;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  actions?: React.ReactNode;
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
