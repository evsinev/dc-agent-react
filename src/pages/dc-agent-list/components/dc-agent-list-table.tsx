import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  parsePropertyFilterQuery,
  PROPERTY_FILTERS_QUERY_PARAM_KEY,
  saveQueryFilter,
} from '@/libs/parse-property-filter';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { CollectionPreferencesProps, Pagination, PropertyFilter, StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import Table, { TableProps } from '@cloudscape-design/components/table';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import routing from '@routing';
import DcAgentTablePreferences, {
  DEFAULT_AGENT_PREFERENCES,
  AGENT_PREFERENCES_STORAGE_KEY,
} from './dc-agent-list-preferences';
import { AGENT_FILTERING_PROPERTIES } from './dc-agent-list-table-filters';

type Props = {
  agents: AgentInfo[];
  isLoading: boolean;
  selected: AgentInfo[];
  setSelected: (agents: AgentInfo[]) => void;
  actions?: ReactNode;
};

const reachableCell = (agent: AgentInfo) => (
  <StatusIndicator type={agent.reachable ? 'success' : 'error'}>
    {agent.reachable ? 'Online' : 'Offline'}
  </StatusIndicator>
);

const servicesCell = (agent: AgentInfo) =>
  agent.servicesError ? (
    <StatusIndicator type="error">error</StatusIndicator>
  ) : (
    `${agent.servicesUp} / ${agent.servicesTotal}`
  );

const columnDefinitions: TableProps.ColumnDefinition<AgentInfo>[] = [
  {
    id: 'name',
    header: 'Agent',
    cell: (a) => <Link to={routing.agent.replace(':name', a.name)}>{a.name}</Link>,
    sortingField: 'name',
    isRowHeader: true,
  },
  { id: 'reachable', header: 'Status', cell: reachableCell, sortingField: 'reachable' },
  { id: 'appInstanceName', header: 'Instance', cell: (a) => a.appInstanceName ?? '—', sortingField: 'appInstanceName' },
  { id: 'appVersion', header: 'Version', cell: (a) => a.appVersion ?? '—', sortingField: 'appVersion' },
  { id: 'hostname', header: 'Reported host', cell: (a) => a.hostname ?? '—', sortingField: 'hostname' },
  { id: 'port', header: 'Port', cell: (a) => (a.port ? String(a.port) : '—'), sortingField: 'port' },
  { id: 'services', header: 'Services', cell: servicesCell },
  { id: 'uptime', header: 'Uptime', cell: (a) => a.uptimeFormatted ?? '—', sortingField: 'uptimeMs' },
  { id: 'url', header: 'URL', cell: (a) => a.url, sortingField: 'url' },
];

export default function DcAgentListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    AGENT_PREFERENCES_STORAGE_KEY,
    DEFAULT_AGENT_PREFERENCES,
  );

  const { items, collectionProps, propertyFilterProps, paginationProps } = useCollection(props.agents, {
    sorting: {},
    pagination: { pageSize: preferences.pageSize },
    propertyFiltering: {
      filteringProperties: AGENT_FILTERING_PROPERTIES,
      defaultQuery: parsePropertyFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY)),
    },
  });

  return (
    <Table
      {...collectionProps}
      header={
        <Header
          counter={`(${props.agents.length})`}
          actions={props.actions}
        >
          dc-agents
        </Header>
      }
      selectionType="single"
      onSelectionChange={(e) => props.setSelected(e.detail.selectedItems)}
      selectedItems={props.selected}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.contentDisplay}
      items={items}
      trackBy="name"
      loading={props.isLoading}
      loadingText="Loading dc-agents"
      wrapLines={preferences.wrapLines}
      stripedRows={preferences.stripedRows}
      contentDensity={preferences.contentDensity}
      stickyColumns={preferences.stickyColumns}
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          expandToViewport={true}
          onChange={(event) => {
            saveQueryFilter(event, setQueryParam);
            propertyFilterProps.onChange(event);
          }}
        />
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <DcAgentTablePreferences
          preferences={preferences}
          onConfirm={setPreferences}
        />
      }
    />
  );
}
