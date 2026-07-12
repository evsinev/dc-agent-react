import Label from '@/components/label';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { ColumnLayout, Container, Header, SpaceBetween, StatusIndicator, Table } from '@cloudscape-design/components';
import routing from '@routing';
import { Link } from 'react-router';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentDetailsPanel({ agent }: Props) {
  return (
    <SpaceBetween size="l">
      <ColumnLayout
        columns={3}
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
          <SpaceBetween size="l">
            <Label label="Instance">{agent.appInstanceName ?? '—'}</Label>
            <Label label="Version">{agent.appVersion ?? '—'}</Label>
            <Label label="Reported host">{agent.hostname ?? '—'}</Label>
            <Label label="Port">{agent.port ? String(agent.port) : '—'}</Label>
            <Label label="Uptime">{agent.uptimeFormatted ?? '—'}</Label>
            <Label label="Response id">{agent.responseId ?? '—'}</Label>
          </SpaceBetween>
        </Container>

        <Container header={<Header headingTagOverride="h3">Services</Header>}>
          <SpaceBetween size="l">
            <Label label="Running">
              {agent.servicesError ? (
                <StatusIndicator type="error">{agent.servicesError}</StatusIndicator>
              ) : (
                `${agent.servicesUp} / ${agent.servicesTotal}`
              )}
            </Label>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {agent.services && agent.services.length > 0 && (
        <Table
          variant="embedded"
          header={<Header headingTagOverride="h3">{`Services on ${agent.name}`}</Header>}
          items={agent.services}
          trackBy="serviceName"
          columnDefinitions={[
            {
              id: 'serviceName',
              header: 'Service',
              cell: (service) => (
                <Link to={routing.service.replace(':host/:serviceName', `${agent.name}/${service.serviceName}`)}>
                  {service.serviceName}
                </Link>
              ),
              isRowHeader: true,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (service) => <StatusIndicator type={service.statusIndicator}>{service.statusName}</StatusIndicator>,
            },
          ]}
        />
      )}
    </SpaceBetween>
  );
}
