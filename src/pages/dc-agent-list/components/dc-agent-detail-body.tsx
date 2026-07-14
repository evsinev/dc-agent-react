import { useQueryParams } from '@/hooks/use-query-params';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { Tabs } from '@cloudscape-design/components';
import SpaceBetween from '@cloudscape-design/components/space-between';
import DcAgentCommandsTable from './dc-agent-commands-table';
import DcAgentDetailsPanel from './dc-agent-details-panel';
import DcAgentServicesTable from './dc-agent-services-table';

type Props = {
  agent: AgentInfo;
};

// Persist the active tab in the URL (`?tab=`) so it survives navigating to a service and back.
const TAB_QUERY_PARAM = 'tab';
const DEFAULT_TAB = 'commands';

export default function DcAgentDetailBody({ agent }: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const activeTabId = getQueryParam(TAB_QUERY_PARAM) ?? DEFAULT_TAB;

  return (
    <SpaceBetween size="l">
      <DcAgentDetailsPanel agent={agent} />
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setQueryParam(TAB_QUERY_PARAM, detail.activeTabId)}
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
