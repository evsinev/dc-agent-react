import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { useServiceList } from '@/pages/service-list/api/service-list';
import ServiceListTable from '@/pages/service-list/components/service-list-table';
import { DEFAULT_SERVICE_PREFERENCES } from '@/pages/service-list/components/service-list-preferences';

type Props = { agent: AgentInfo };

// Scoped to one host, so hide the (redundant) Host column by default — still toggleable in the gear.
const AGENT_SERVICE_PREFERENCES = {
  ...DEFAULT_SERVICE_PREFERENCES,
  contentDisplay: DEFAULT_SERVICE_PREFERENCES.contentDisplay?.map((column) =>
    column.id === 'host' ? { ...column, visible: false } : column,
  ),
};

// The full Service List table, embedded in the Agent View tab and pre-filtered to this host. Uses the
// standalone /service/list feed (SWR-cached) rather than the lightweight agent.services brief, so the
// State/Age columns, sorting, and property filtering all work here too.
export default function DcAgentServicesTable({ agent }: Props) {
  const { data, isLoading, error, mutate } = useServiceList();
  const services = (data?.services ?? []).filter((service) => service.host === agent.name);

  return (
    <ServiceListTable
      services={services}
      isLoading={isLoading}
      error={error}
      onRetry={() => mutate()}
      variant="embedded"
      urlState={false}
      selectable={false}
      storageKeyPrefix="agent-services"
      defaultPreferences={AGENT_SERVICE_PREFERENCES}
      title={`Services on ${agent.name}`}
    />
  );
}
