import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { Tabs } from '@cloudscape-design/components';
import SpaceBetween from '@cloudscape-design/components/space-between';
import DcAgentCommandsTable from './dc-agent-commands-table';
import DcAgentDetailsPanel from './dc-agent-details-panel';
import DcAgentServicesTable from './dc-agent-services-table';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentDetailBody({ agent }: Props) {
  return (
    <SpaceBetween size="l">
      <DcAgentDetailsPanel agent={agent} />
      <Tabs
        tabs={[
          {
            id: 'commands',
            label: 'Commands',
            content: <DcAgentCommandsTable agent={agent} />,
          },
          {
            id: 'services',
            label: 'Services',
            content: <DcAgentServicesTable agent={agent} />,
          },
        ]}
      />
    </SpaceBetween>
  );
}
