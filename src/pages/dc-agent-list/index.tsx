import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { AgentInfo, useAgentList } from '@/pages/dc-agent-list/api/agent-list';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';
import DcAgentDetailBody from './components/dc-agent-detail-body';
import DcAgentListTable from './components/dc-agent-list-table';

export default function DcAgentList() {
  useDocumentTitle('Agents');
  const { data, isLoading, error, mutate } = useAgentList();
  const [selected, setSelected] = useState<AgentInfo[]>([]);

  const show = useSplitPanel((state) => state.show);
  const hide = useSplitPanel((state) => state.hide);

  useEffect(() => {
    if (selected.length > 0) {
      const agent = selected[selected.length - 1];
      show({
        content: <DcAgentDetailBody agent={agent} />,
        title: agent.name,
      });
    } else {
      hide();
    }
  }, [selected]);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        Agents
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <DcAgentListTable
        agents={data?.agents ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => mutate()}
        selected={selected}
        setSelected={setSelected}
      />
    </SpaceBetween>
  );
}
