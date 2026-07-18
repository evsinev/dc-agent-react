import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { useCommandList } from '@/pages/command-list/api/command-list';
import CommandListTable from '@/pages/command-list/components/command-list-table';
import { DEFAULT_COMMAND_PREFERENCES } from '@/pages/command-list/components/command-list-preferences';
import { Button } from '@cloudscape-design/components';
import routing from '@routing';
import { useNavigate } from 'react-router';

type Props = { agent: AgentInfo };

// Scoped to one host, so hide the (redundant) Host column by default — still toggleable in the gear.
const AGENT_COMMAND_PREFERENCES = {
  ...DEFAULT_COMMAND_PREFERENCES,
  contentDisplay: DEFAULT_COMMAND_PREFERENCES.contentDisplay?.map((column) =>
    column.id === 'host' ? { ...column, visible: false } : column,
  ),
};

// The full Command List table, embedded in the Agent View tab and pre-filtered to this host, so it
// carries the same property filter, saved filter sets, and column/density preferences.
export default function DcAgentCommandsTable({ agent }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isValidating, error, mutate } = useCommandList();
  const commands = (data?.commands ?? []).filter((command) => command.host === agent.name);

  return (
    <CommandListTable
      commands={commands}
      isLoading={isLoading}
      isValidating={isValidating}
      error={error}
      onRetry={() => mutate()}
      variant="embedded"
      urlState={false}
      selectable={false}
      storageKeyPrefix="agent-commands"
      defaultPreferences={AGENT_COMMAND_PREFERENCES}
      title={`Commands on ${agent.name}`}
      actions={
        <Button onClick={() => navigate(`${routing.commandCreate}?agent=${encodeURIComponent(agent.name)}`)}>
          Add command
        </Button>
      }
    />
  );
}
