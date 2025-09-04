import { StatusIndicator } from '@cloudscape-design/components';
import { useRemoteAppStatus } from '@/pages/app-list/api/app-list';

type Props = {
  appName: string;
};

export function AppStatusIndicator({ appName }: Props) {
  const { data, isLoading, isValidating } = useRemoteAppStatus({appName});

  if (isLoading) {
    return <StatusIndicator type="loading" />;
  }

  const type = data?.status;

  if (type === 'OK') {
    return (
      <StatusIndicator
        type="success"
        colorOverride={isValidating ? 'grey' : undefined}
      >
        OK
      </StatusIndicator>
    );
  }

  if (type === 'ERROR') {
    return (
      <StatusIndicator
        type="error"
        colorOverride={isValidating ? 'grey' : undefined}
      >
        {data?.errorMessage}
      </StatusIndicator>
    );
  }

  if (type === 'DRIFT') {
    return (
      <StatusIndicator
        type="warning"
        colorOverride={isValidating ? 'grey' : undefined}
      >
        {data?.errorMessage}
      </StatusIndicator>
    );
  }

  // NOT_MATCHED
  return (
    <StatusIndicator
      type="error"
      colorOverride={isValidating ? 'grey' : undefined}
    >
      UNKNOWN: {data?.errorMessage}
    </StatusIndicator>
  );
}
