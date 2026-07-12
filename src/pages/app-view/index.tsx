import DefinitionList from '@/components/definition-list';
import InfoButton from '@/components/info/info-button';
import { useDocumentTitle } from '@/hooks/use-document-title';
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

  // Only the full-page route (showAppInfo) owns the tab title; the embedded
  // split-panel instance passes undefined so it doesn't hijack it.
  useDocumentTitle(props.showAppInfo ? `App ${appName}` : undefined);

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
            <DefinitionList
              columns={1}
              ariaLabel="App and Agent"
              termWidth="110px"
              items={[
                { label: 'App name', value: <StatusIndicator type="loading" /> },
                { label: 'Agent url', value: <StatusIndicator type="loading" /> },
              ]}
            />
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <DefinitionList
              columns={1}
              ariaLabel="Task"
              termWidth="110px"
              items={[
                { label: 'Task name', value: <StatusIndicator type="loading" /> },
                { label: 'Task type', value: <StatusIndicator type="loading" /> },
                { label: 'Task host', value: <StatusIndicator type="loading" /> },
              ]}
            />
          </Container>
        </ColumnLayout>
      )}

      {props.showAppInfo && appView && (
        <ColumnLayout
          columns={3}
          variant="text-grid"
        >
          <Container header={<Header headingTagOverride="h3">App and Agent</Header>}>
            <DefinitionList
              columns={1}
              ariaLabel="App and Agent"
              termWidth="110px"
              items={[
                { label: 'App name', value: appView.appName },
                { label: 'Agent url', value: appView.agentUrl },
              ]}
            />
          </Container>
          <Container header={<Header headingTagOverride="h3">Task</Header>}>
            <DefinitionList
              columns={1}
              ariaLabel="Task"
              termWidth="110px"
              items={[
                { label: 'Task name', value: appView.taskName },
                { label: 'Task type', value: appView.taskType },
                { label: 'Task host', value: appView.taskHost },
              ]}
            />
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
