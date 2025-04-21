import { useAppPush, useAppView } from '@/pages/app-list/api';
import CodeHighlight from '@/pages/app-list/components/code-highlight';
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components';
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
  const { data: appView, isLoading, mutate: resetApp } = useAppView({ appName });
  const { isMutating, trigger, data: mutatingData } = useAppPush();

  async function makePush() {
    await trigger({ appName });
    await resetApp();
  }

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        App {appName} {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {isLoading && (
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

      {appView && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="App name">{appView.appName}</ValueWithLabel>
              <ValueWithLabel label="Agent url">{appView.agentUrl}</ValueWithLabel>
            </SpaceBetween>
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <SpaceBetween size="l">
              <ValueWithLabel label="Task name">{appView.taskName}</ValueWithLabel>
              <ValueWithLabel label="Task type">{appView.taskType}</ValueWithLabel>
              <ValueWithLabel label="Task host">{appView.taskHost}</ValueWithLabel>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      )}

      <Container header={<Header>Check</Header>}>{appView && <CodeHighlight code={appView.taskCheckText} />}</Container>

      <Container header={<Header variant="h3">Push</Header>}>
        {isMutating && <StatusIndicator type="loading" />}

        {mutatingData && <CodeHighlight code={mutatingData.taskCheckText} />}

        <Button
          onClick={makePush}
          loading={isMutating}
        >
          Push config
        </Button>
      </Container>
    </SpaceBetween>
  );
}
