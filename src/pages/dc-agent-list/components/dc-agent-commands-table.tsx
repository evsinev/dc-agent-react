import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { useCommandList } from '@/pages/command-list/api/command-list';
import { commandNameCell } from '@/pages/command-list/components/command-name-cell';
import { Box, Button, Header, Table } from '@cloudscape-design/components';
import routing from '@routing';
import { useNavigate } from 'react-router';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentCommandsTable({ agent }: Props) {
  const navigate = useNavigate();
  const { data } = useCommandList();
  const commands = (data?.commands ?? []).filter((command) => command.host === agent.name);

  return (
    <Table
      variant="embedded"
      header={
        <Header
          counter={`(${commands.length})`}
          actions={
            <Button onClick={() => navigate(`${routing.commandCreate}?agent=${encodeURIComponent(agent.name)}`)}>
              Add command
            </Button>
          }
        >
          {`Commands on ${agent.name}`}
        </Header>
      }
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
