import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { CommandInfo, useCommandList } from '@/pages/command-list/api/command-list';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';
import CommandDetailsPanel from './components/command-details-panel';
import CommandListTable from './components/command-list-table';

export default function CommandList() {
  useDocumentTitle('Command list');
  const { data, isLoading } = useCommandList();
  const [selected, setSelected] = useState<CommandInfo[]>([]);

  const show = useSplitPanel((state) => state.show);
  const hide = useSplitPanel((state) => state.hide);

  useEffect(() => {
    if (selected.length > 0) {
      const command = selected[selected.length - 1];
      show({
        content: <CommandDetailsPanel command={command} />,
        title: command.name ?? command.host,
      });
    } else {
      hide();
    }
  }, [selected]);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        Command list
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <CommandListTable
        commands={data?.commands ?? []}
        isLoading={isLoading}
        selected={selected}
        setSelected={setSelected}
      />
    </SpaceBetween>
  );
}
