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
import { Box, Button, Container, Header, SpaceBetween, StatusIndicator, Table } from '@cloudscape-design/components';
import routing from '@routing';
import { Link, useNavigate, useParams } from 'react-router';

export default function CommandView() {
  const { host, name } = useParams();
  useDocumentTitle(name ? `Command: ${name}` : 'Command');
  const navigate = useNavigate();

  const { data: command, isLoading, error, mutate } = useCommandGet(host, name);

  const type = command?.type;
  const configFields = isCommandType(type) ? COMMAND_TYPES[type].fields : [];

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
