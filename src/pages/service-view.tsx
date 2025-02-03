import { useParams } from 'react-router';
import { Alert, Box, Button, ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import shHighlight from '@cloudscape-design/code-view/highlight/sh';
import { CodeView } from '@cloudscape-design/code-view';
import * as React from 'react';
import { remoteServiceView } from '@/remote/remote-service-view';
import { remoteServiceSendAction, ServiceActionType, ServiceSendActionResponse } from '@/remote/remote-service-send-action';

const ValueWithLabel = ({ label, children }: { label: string, children: any }) => (
  <div>
    <Box variant="awsui-key-label">{label}</Box>
    <div>{children}</div>
  </div>
);

export default function ServiceView() {
  const { host, serviceName } = useParams();
  const fqsn = `${host}/${serviceName}`;

  const {
    isPending,
    data,
    isSuccess,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['fqsn', fqsn],
    queryFn: () => remoteServiceView({ fqsn }),
  });

  const mutation = useMutation({
    mutationFn: (serviceAction : ServiceActionType) => remoteServiceSendAction({
      fqsn, serviceAction
    }),
    onSuccess(data: ServiceSendActionResponse) {
      refetch();
    },
  });

  return (
    <SpaceBetween size="m">
      <Header
        variant="h1"
        actions={(
          <SpaceBetween size="xs" direction="horizontal">
            {data?.canHangup && <Button disabled={mutation.isPending} iconName="angle-right" onClick={() => mutation.mutate('HANGUP')}>Send HUP</Button>}
            {data?.canTerminate && <Button disabled={mutation.isPending} iconName="angle-right-double" onClick={() => mutation.mutate('TERMINATE')}>Send TERM</Button>}
            {data?.canUp && <Button disabled={mutation.isPending} iconName="angle-up" onClick={() => mutation.mutate('UP')}>Up</Button>}
            {data?.canDown && <Button disabled={mutation.isPending} iconName="angle-down" onClick={() => mutation.mutate('DOWN')}>Down</Button>}
            {mutation.isPending && (
              <StatusIndicator type="loading">
                Sending ...
              </StatusIndicator>
            )}
          </SpaceBetween>
        )}
      >
        Service {fqsn} {' '}
        {isFetching && !isPending && (
          <StatusIndicator type="loading">
            Fetching
          </StatusIndicator>
        )}
      </Header>

      {isPending && (
        <>
          <StatusIndicator type="loading">
            Pending ...
          </StatusIndicator>
        </>
      )}

      {isError && (
        <>
          <Alert
            statusIconAriaLabel="Error"
            header="Something wrong"
          >
            Error while loading
          </Alert>
        </>
      )}

      {isSuccess && (
        <>
          <ColumnLayout columns={3} variant="text-grid">
            <Container header={<Header headingTagOverride="h3">Service</Header>}>
              <SpaceBetween size="l">
                <ValueWithLabel label="Service">{data.service.serviceName}</ValueWithLabel>
                <ValueWithLabel label="Host">{data.service.host}</ValueWithLabel>
                <ValueWithLabel label="Status"><StatusIndicator type={data.service.statusIndicator}>{data.service.statusName}</StatusIndicator></ValueWithLabel>
                <ValueWithLabel label="Age">{data.service.ageFormatted}</ValueWithLabel>
              </SpaceBetween>
            </Container>
            <Container header={<Header headingTagOverride="h3">Supervise status</Header>}>
              <SpaceBetween size="l">
                <ValueWithLabel label="PID">{data.service.serviceStatus.pid}</ValueWithLabel>
                <ValueWithLabel label="Supervise">{data.service.serviceStatus.superviseState}</ValueWithLabel>
                <ValueWithLabel label="State">{data.service.serviceStatus.state}</ValueWithLabel>
                <ValueWithLabel label="When">{data.service.whenFormatted}</ValueWithLabel>
              </SpaceBetween>
            </Container>
          </ColumnLayout>

          <Container header={<Header headingTagOverride="h3">/service/{data.service.serviceName}/run</Header>}>
            <CodeView highlight={shHighlight} lineNumbers content={data.runContent} />
          </Container>

          <Container header={<Header headingTagOverride="h3">/service/{data.service.serviceName}/log/run</Header>}>
            <CodeView highlight={shHighlight} lineNumbers content={data.logRunContent} />
          </Container>

          <Container header={<Header headingTagOverride="h3">/var/log/{data.service.serviceName}/current</Header>}>
            <CodeView highlight="" lineNumbers content={data.lastLogLines} />
          </Container>
        </>
      )}

    </SpaceBetween>
  );
}
