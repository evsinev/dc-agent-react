import DefinitionList from '@/components/definition-list';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { ColumnLayout, Container, Header, StatusIndicator } from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentDetailsPanel({ agent }: Props) {
  return (
    <ColumnLayout
      columns={2}
      variant="text-grid"
    >
      <Container header={<Header headingTagOverride="h3">Agent</Header>}>
        <DefinitionList
          columns={1}
          ariaLabel="Agent details"
          termWidth="140px"
          items={[
            { label: 'Name', value: agent.name },
            { label: 'URL', value: agent.url },
            {
              label: 'Status',
              value: (
                <StatusIndicator type={agent.reachable ? 'success' : 'error'}>
                  {agent.reachable ? 'Online' : 'Offline'}
                </StatusIndicator>
              ),
            },
            ...(agent.error ? [{ label: 'Error', value: agent.error }] : []),
          ]}
        />
      </Container>

      <Container header={<Header headingTagOverride="h3">App status</Header>}>
        <DefinitionList
          columns={2}
          ariaLabel="App status"
          termWidth="110px"
          items={[
            { label: 'Instance', value: agent.appInstanceName ?? '—' },
            { label: 'Version', value: agent.appVersion ?? '—' },
            { label: 'Reported host', value: agent.hostname ?? '—' },
            { label: 'Port', value: agent.port ? String(agent.port) : '—' },
            { label: 'Uptime', value: agent.uptimeFormatted ?? '—' },
            { label: 'Response id', value: agent.responseId ?? '—' },
          ]}
        />
      </Container>
    </ColumnLayout>
  );
}
