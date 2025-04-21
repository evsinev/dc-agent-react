import { Header, StatusIndicator } from '@cloudscape-design/components';
import { ReactNode } from 'react';

type Props = {
  description: string;
  children?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  actions?: ReactNode;
};

export default function LoadingHeader(props: Props) {
  const text = props.isLoading ? 'Loading...' : props.isError ? 'Error' : null;
  const header = text ? <StatusIndicator type="loading">Loading ...</StatusIndicator> : null;

  return (
    <Header
      info={header}
      description={props.description}
      actions={props.actions}
    >
      {props.children}
    </Header>
  );
}
