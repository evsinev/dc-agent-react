import DefinitionList from '@/components/definition-list';
import LoadError from '@/components/error/components/load-error';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useCommandGet } from '@/pages/command-list/api/command-mutations';
import {
  COMMAND_TYPES,
  commandConfigFile,
  commandEndpoint,
  commandTypeLabel,
  isCommandType,
} from '@/pages/command-list/api/command-types';
import { useAgentList } from '@/pages/dc-agent-list/api/agent-list';
import { CodeView, type CodeViewProps } from '@cloudscape-design/code-view';
// @ts-ignore incorrect type export in the library
import shHighlight from '@cloudscape-design/code-view/highlight/sh';
// @ts-ignore incorrect type export in the library
import yamlHighlight from '@cloudscape-design/code-view/highlight/yaml';
import {
  Box,
  Button,
  Container,
  CopyToClipboard,
  Header,
  SpaceBetween,
  StatusIndicator,
  Table,
  Tabs,
} from '@cloudscape-design/components';
import routing from '@routing';
import { Link, useNavigate, useParams } from 'react-router';
import { type UsageSnippets, buildDeployUrl, buildUsageSnippets, isUploadType } from './usage-snippets';

// The four deploy-snippet tabs, each a CodeView with a copy button. Shell highlight for curl/wget,
// YAML for the GitLab CI examples.
function UsageTabs({ snippets }: { snippets: UsageSnippets }) {
  const codeTab = (id: string, label: string, content: string, highlight: CodeViewProps['highlight']) => ({
    id,
    label,
    content: (
      <CodeView
        content={content}
        wrapLines
        highlight={highlight}
        actions={
          <CopyToClipboard
            variant="icon"
            textToCopy={content}
            copySuccessText="Copied"
            copyErrorText="Failed to copy"
            copyButtonAriaLabel={`Copy ${label} snippet`}
          />
        }
      />
    ),
  });

  return (
    <Tabs
      tabs={[
        codeTab('curl', 'curl', snippets.curl, shHighlight),
        codeTab('wget', 'wget', snippets.wget, shHighlight),
        codeTab('gitlab-curl', 'gitlab + curl', snippets.gitlabCurl, yamlHighlight),
        codeTab('gitlab-wget', 'gitlab + wget', snippets.gitlabWget, yamlHighlight),
      ]}
    />
  );
}

export default function CommandView() {
  const { host, name } = useParams();
  useDocumentTitle(name ? `Command: ${name}` : 'Command');
  const navigate = useNavigate();

  const { data: command, isLoading, error, mutate } = useCommandGet(host, name);
  const { data: agentData } = useAgentList();

  const type = command?.type;
  const configFields = isCommandType(type) ? COMMAND_TYPES[type].fields : [];
  const agentUrl = agentData?.agents.find((agent) => agent.name === host)?.url;

  return (
    <SpaceBetween size="m">
      <Header
        variant="h1"
        actions={
          command && (
            <Button
              onClick={() =>
                navigate(routing.commandEdit.replace(':host', command.host).replace(':name', command.name))
              }
            >
              Edit
            </Button>
          )
        }
      >
        {name}
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {error && (
        <LoadError
          error={error}
          onRetry={() => mutate()}
          resource="command"
        />
      )}

      {command && (
        <SpaceBetween size="l">
          <Container header={<Header headingTagOverride="h3">Overview</Header>}>
            <DefinitionList
              columns={2}
              ariaLabel="Overview"
              termWidth="110px"
              items={[
                {
                  label: 'Agent',
                  value: <Link to={routing.agent.replace(':name', command.host)}>{command.host}</Link>,
                },
                { label: 'Type', value: commandTypeLabel(command.type) },
                { label: 'Endpoint', value: commandEndpoint(command.type, command.name) },
                { label: 'Config file', value: commandConfigFile(command.name) },
              ]}
            />
          </Container>

          <Container header={<Header headingTagOverride="h3">Configuration</Header>}>
            {configFields.length > 0 ? (
              <DefinitionList
                columns={1}
                ariaLabel="Configuration"
                autoTermWidth
                termWidth="180px"
                items={configFields.map((field) => ({
                  label: field.label,
                  value: command.parameters[field.key] ?? '—',
                }))}
              />
            ) : (
              <Box variant="p">This command type has no configurable fields.</Box>
            )}
          </Container>

          {isUploadType(command.type) && (
            <Container
              header={
                <Header
                  headingTagOverride="h3"
                  description="Replace package.zip and $DEPLOY_KEY with your artifact and deploy key."
                >
                  Usage
                </Header>
              }
            >
              <UsageTabs snippets={buildUsageSnippets(buildDeployUrl(agentUrl, command.type, command.name))} />
            </Container>
          )}

          <Container header={<Header counter={`(${command.apiKeys.length})`}>API keys</Header>}>
            <Table
              variant="embedded"
              items={command.apiKeys}
              trackBy="maskedId"
              empty={<Box variant="p">No API keys — this command is open to any caller.</Box>}
              columnDefinitions={[
                {
                  id: 'maskedId',
                  header: 'API key',
                  cell: (key) => <Box variant="code">{key.maskedId}</Box>,
                  isRowHeader: true,
                },
                { id: 'owner', header: 'Owner label', cell: (key) => key.owner },
              ]}
            />
          </Container>
        </SpaceBetween>
      )}

      {!error && !command && !isLoading && <Box variant="p">Command not found</Box>}
    </SpaceBetween>
  );
}
