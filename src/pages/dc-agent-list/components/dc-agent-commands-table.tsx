import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { useCommandList } from '@/pages/command-list/api/command-list';
import { commandNameCell } from '@/pages/command-list/components/command-name-cell';
import { Box, Header, Table } from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentCommandsTable({ agent }: Props) {
  const { data } = useCommandList();
  const commands = (data?.commands ?? []).filter((command) => command.host === agent.name);

  return (
    <Table
      variant="embedded"
      header={<Header counter={`(${commands.length})`}>{`Commands on ${agent.name}`}</Header>}
      items={commands}
      trackBy={(command) => command.name ?? '(error)'}
      empty={<Box variant="p">No commands configured on this host</Box>}
      columnDefinitions={[
        {
          id: 'name',
          header: 'Command',
          cell: commandNameCell,
          isRowHeader: true,
        },
        { id: 'type', header: 'Type', cell: (command) => command.type ?? '—' },
      ]}
    />
  );
}
