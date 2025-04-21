import CodeHighlight from '@/pages/app-list/components/code-highlight';
import { remoteAppPush, remoteAppView } from '@/remote/remote-app-view';
import { Alert, Box, Button, ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

function ValueWithLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{children}</div>
    </div>
  );
}

export default function AppDetail({ appName }: { appName: string }) {
  const { isPending, data, isSuccess, isFetching } = useQuery({
    queryKey: ['app', appName],
    queryFn: () => remoteAppView({ appName }),
  });

  const mutation = useMutation({
    mutationFn: remoteAppPush,
  });

  function makePush() {
    mutation.mutate({ appName });
  }

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        App {appName} {isFetching && !isPending && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {isPending && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="App name">
                <StatusIndicator type="loading" />
              </ValueWithLabel>
              <ValueWithLabel label="Agent url">
                <StatusIndicator type="loading" />
              </ValueWithLabel>
            </SpaceBetween>
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="Task name">
                <StatusIndicator type="loading" />
              </ValueWithLabel>
              <ValueWithLabel label="Task type">
                <StatusIndicator type="loading" />
              </ValueWithLabel>
              <ValueWithLabel label="Task host">
                <StatusIndicator type="loading" />
              </ValueWithLabel>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      )}

      {isSuccess && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="App name">{data.appName}</ValueWithLabel>
              <ValueWithLabel label="Agent url">{data.agentUrl}</ValueWithLabel>
            </SpaceBetween>
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="Task name">{data.taskName}</ValueWithLabel>
              <ValueWithLabel label="Task type">{data.taskType}</ValueWithLabel>
              <ValueWithLabel label="Task host">{data.taskHost}</ValueWithLabel>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      )}

      <Container header={<Header>Check</Header>}>{isSuccess && <CodeHighlight code={data.taskCheckText} />}</Container>

      <Container header={<Header variant="h3">Push</Header>}>
        {mutation.isPending && <StatusIndicator type="loading" />}

        {mutation.isSuccess && <CodeHighlight code={mutation.data.taskCheckText} />}

        {mutation.isIdle && <Button onClick={() => makePush()}>Push config</Button>}

        {mutation.isError && <Alert header={mutation.error.name}>{mutation.error.message}</Alert>}
      </Container>
    </SpaceBetween>
  );
}
