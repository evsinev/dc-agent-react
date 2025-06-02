import InfoButton from '@/components/info/info-button';
import Label from '@/components/label';
import {
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  Spinner,
  StatusIndicator,
} from '@cloudscape-design/components';
import { useParams } from 'react-router';
import { useAppPush, useAppView } from './api/app-view';
import CodeHighlight from './components/code-highlight';

interface Props {
  appName?: string;
  showAppInfo?: boolean;
}

export default function AppView(props: Props) {
  const params = useParams();
  const appName = params.appName || (props.appName as string);

  const { data: appView, isLoading, isValidating, mutate: resetApp } = useAppView({ appName });
  const { isMutating, trigger, data: mutatingData } = useAppPush({ appName });

  async function makePush() {
    await trigger();
    await resetApp();
  }

  return (
    <SpaceBetween size="m">
      {props.showAppInfo && (
        <Header
          variant="h1"
          info={
            <InfoButton
              infoKey="application.info"
              infoTitle="Info title"
            />
          }
        >
          App {appName} {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
        </Header>
      )}

      {props.showAppInfo && isLoading && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <SpaceBetween size="l">
              <Label label="App name">
                <StatusIndicator type="loading" />
              </Label>
              <Label label="Agent url">
                <StatusIndicator type="loading" />
              </Label>
            </SpaceBetween>
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <SpaceBetween size="l">
              <Label label="Task name">
                <StatusIndicator type="loading" />
              </Label>
              <Label label="Task type">
                <StatusIndicator type="loading" />
              </Label>
              <Label label="Task host">
                <StatusIndicator type="loading" />
              </Label>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      )}

      {props.showAppInfo && appView && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <SpaceBetween size="l">
              <Label label="App name">{appView.appName}</Label>
              <Label label="Agent url">{appView.agentUrl}</Label>
            </SpaceBetween>
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <SpaceBetween size="l">
              <Label label="Task name">{appView.taskName}</Label>
              <Label label="Task type">{appView.taskType}</Label>
              <Label label="Task host">{appView.taskHost}</Label>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      )}

      <Container header={<Header actions={isValidating && <Spinner />}>Check</Header>}>
        {appView && <CodeHighlight code={appView.taskCheckText} />}
      </Container>

      <Container
        header={
          <Header
            variant="h3"
            actions={isValidating && <StatusIndicator type="loading" />}
          >
            Push
          </Header>
        }
      >
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
