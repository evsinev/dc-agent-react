import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { CommandInfo, useCommandList } from '@/pages/command-list/api/command-list';
import { Button, StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import routing from '@routing';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import CommandDetailsPanel from './components/command-details-panel';
import CommandListTable from './components/command-list-table';

export default function CommandList() {
  useDocumentTitle('Commands');
  const navigate = useNavigate();
  const { data, isLoading, error, mutate } = useCommandList();
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
        Commands
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <CommandListTable
        commands={data?.commands ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => mutate()}
        selected={selected}
        setSelected={setSelected}
        actions={
          <Button
            variant="primary"
            onClick={() => navigate(routing.commandCreate)}
          >
            Add command
          </Button>
        }
      />
    </SpaceBetween>
  );
}
