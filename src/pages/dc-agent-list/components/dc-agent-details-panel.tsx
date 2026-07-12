import Label from '@/components/label';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';

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
        <SpaceBetween size="l">
          <Label label="Name">{agent.name}</Label>
          <Label label="URL">{agent.url}</Label>
          <Label label="Status">
            <StatusIndicator type={agent.reachable ? 'success' : 'error'}>
              {agent.reachable ? 'Online' : 'Offline'}
            </StatusIndicator>
          </Label>
          {agent.error && <Label label="Error">{agent.error}</Label>}
        </SpaceBetween>
      </Container>

      <Container header={<Header headingTagOverride="h3">App status</Header>}>
        <ColumnLayout columns={2}>
          <Label label="Instance">{agent.appInstanceName ?? '—'}</Label>
          <Label label="Version">{agent.appVersion ?? '—'}</Label>
          <Label label="Reported host">{agent.hostname ?? '—'}</Label>
          <Label label="Port">{agent.port ? String(agent.port) : '—'}</Label>
          <Label label="Uptime">{agent.uptimeFormatted ?? '—'}</Label>
          <Label label="Response id">{agent.responseId ?? '—'}</Label>
        </ColumnLayout>
      </Container>
    </ColumnLayout>
  );
}
