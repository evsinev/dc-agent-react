import { ServiceActionType, ServiceView, useServiceAction } from '@/pages/service-view/api';
import { Button, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';

type Props = {
  isLoading?: boolean;
  service?: ServiceView;
  fqsn: string;
  refetch: () => void;
};

export default function ServiceHeader({ service, isLoading, fqsn, refetch }: Props) {
  const { trigger, isMutating } = useServiceAction();

  const loading = isMutating || isLoading;

  const sendAction = async (serviceAction: ServiceActionType) => {
    await trigger({ fqsn, serviceAction });
    refetch();
  };

  return (
    <Header
      variant="h1"
      actions={
        <SpaceBetween
          size="xs"
          direction="horizontal"
        >
          {service?.canHangup && (
            <Button
              disabled={loading}
              iconName="angle-right"
              onClick={() => sendAction('HANGUP')}
            >
              Send HUP
            </Button>
          )}
          {service?.canTerminate && (
            <Button
              disabled={loading}
              iconName="angle-right-double"
              onClick={() => sendAction('TERMINATE')}
            >
              Send TERM
            </Button>
          )}
          {service?.canUp && (
            <Button
              disabled={loading}
              iconName="angle-up"
              onClick={() => sendAction('UP')}
            >
              Up
            </Button>
          )}
          {service?.canDown && (
            <Button
              disabled={loading}
              iconName="angle-down"
              onClick={() => sendAction('DOWN')}
            >
              Down
            </Button>
          )}
          {loading && <StatusIndicator type="loading">Sending ...</StatusIndicator>}
        </SpaceBetween>
      }
    >
      Service {fqsn} {loading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
    </Header>
  );
}
