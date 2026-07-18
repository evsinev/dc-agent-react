import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { AgentInfo, useAgentList } from '@/pages/dc-agent-list/api/agent-list';
import { useEffect, useState } from 'react';
import DcAgentDetailBody from './components/dc-agent-detail-body';
import DcAgentListTable from './components/dc-agent-list-table';

export default function DcAgentList() {
  useDocumentTitle('Agents');
  const { data, isLoading, isValidating, error, mutate } = useAgentList();
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
    <DcAgentListTable
      agents={data?.agents ?? []}
      isLoading={isLoading}
      isValidating={isValidating}
      error={error}
      onRetry={() => mutate()}
      selected={selected}
      setSelected={setSelected}
    />
  );
}
