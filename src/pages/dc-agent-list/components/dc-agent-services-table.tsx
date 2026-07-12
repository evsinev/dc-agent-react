import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { Box, Header, StatusIndicator, Table } from '@cloudscape-design/components';
import routing from '@routing';
import { Link } from 'react-router';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentServicesTable({ agent }: Props) {
  const services = agent.services ?? [];

  return (
    <Table
      variant="embedded"
      header={<Header counter={`(${services.length})`}>{`Services on ${agent.name}`}</Header>}
      items={services}
      trackBy="serviceName"
      empty={<Box variant="p">{agent.servicesError ?? 'No services on this host'}</Box>}
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
  );
}
