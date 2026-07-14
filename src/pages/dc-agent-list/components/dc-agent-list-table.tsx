import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  PAGE_QUERY_PARAM_KEY,
  PROPERTY_FILTERS_QUERY_PARAM_KEY,
  saveQueryFilter,
  SORT_QUERY_PARAM_KEY,
} from '@/libs/parse-property-filter';
import {
  resolveDefaultFilterQuery,
  useFilterSetControls,
} from '@/components/table-filter-sets/use-filter-set-controls';
import { FilterSet } from '@/components/table-filter-sets/use-filter-sets';
import { AgentInfo, AgentMetrics } from '@/pages/dc-agent-list/api/agent-list';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Box,
  Button,
  CollectionPreferencesProps,
  Pagination,
  PropertyFilter,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import Table, { TableProps } from '@cloudscape-design/components/table';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import routing from '@routing';
import LoadError from '@/components/error/components/load-error';
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
  error?: unknown;
  onRetry: () => void;
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

// Metric columns display the human-readable *Text but sort on the raw numeric value.
const metricRaw = (agent: AgentInfo, key: keyof AgentMetrics): number => {
  const value = agent.metrics?.[key];
  return typeof value === 'number' ? value : -1;
};
const byMetric =
  (key: keyof AgentMetrics) =>
  (a: AgentInfo, b: AgentInfo): number =>
    metricRaw(a, key) - metricRaw(b, key);
const metricText = (agent: AgentInfo, key: keyof AgentMetrics): string => {
  const value = agent.metrics?.[key];
  return value === undefined || value === null ? '—' : String(value);
};

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
  // System / JVM metrics (display formatted text, sort by raw value)
  {
    id: 'systemCpu',
    header: 'Sys CPU',
    cell: (a) => a.metrics?.systemCpuLoadText ?? '—',
    sortingComparator: byMetric('systemCpuLoad'),
  },
  {
    id: 'processCpu',
    header: 'Proc CPU',
    cell: (a) => a.metrics?.processCpuLoadText ?? '—',
    sortingComparator: byMetric('processCpuLoad'),
  },
  {
    id: 'loadAvg',
    header: 'Load avg',
    cell: (a) => a.metrics?.loadAverageText ?? '—',
    sortingComparator: byMetric('loadAverage'),
  },
  {
    id: 'heapUsed',
    header: 'Heap used',
    cell: (a) => a.metrics?.heapUsedText ?? '—',
    sortingComparator: byMetric('heapUsedBytes'),
  },
  {
    id: 'heapPct',
    header: 'Heap %',
    cell: (a) => a.metrics?.heapUsedPercentText ?? '—',
    sortingComparator: byMetric('heapUsedFraction'),
  },
  {
    id: 'memUsed',
    header: 'Mem used',
    cell: (a) => a.metrics?.physicalUsedText ?? '—',
    sortingComparator: byMetric('physicalUsedBytes'),
  },
  {
    id: 'memPct',
    header: 'Mem %',
    cell: (a) => a.metrics?.physicalUsedPercentText ?? '—',
    sortingComparator: byMetric('physicalUsedFraction'),
  },
  {
    id: 'threads',
    header: 'Threads',
    cell: (a) => metricText(a, 'threadCount'),
    sortingComparator: byMetric('threadCount'),
  },
  {
    id: 'gcTime',
    header: 'GC time',
    cell: (a) => a.metrics?.gcTimeText ?? '—',
    sortingComparator: byMetric('gcTimeMs'),
  },
  { id: 'url', header: 'URL', cell: (a) => a.url, sortingField: 'url' },
];

export default function DcAgentListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    AGENT_PREFERENCES_STORAGE_KEY,
    DEFAULT_AGENT_PREFERENCES,
  );

  const [savedFilterSets, setSavedFilterSets] = useLocalStorage<FilterSet[]>('dc-agent-list-filter-sets', []);

  const defaultPage = Math.max(1, Number(getQueryParam(PAGE_QUERY_PARAM_KEY)) || 1);
  const sortParam = getQueryParam(SORT_QUERY_PARAM_KEY);
  const defaultSortingState = sortParam
    ? { sortingColumn: { sortingField: sortParam.replace(/^-/, '') }, isDescending: sortParam.startsWith('-') }
    : undefined;

  const { items, actions, collectionProps, propertyFilterProps, paginationProps, filteredItemsCount } = useCollection(
    props.agents,
    {
      sorting: { defaultState: defaultSortingState },
      pagination: { pageSize: preferences.pageSize, defaultPage },
      propertyFiltering: {
        filteringProperties: AGENT_FILTERING_PROPERTIES,
        defaultQuery: resolveDefaultFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY), savedFilterSets),
      },
    },
  );

  const { customControl, customFilterActions, actionModal, countText } = useFilterSetControls({
    propertyFilterProps,
    actions,
    getQueryParam,
    setQueryParam,
    savedFilterSets,
    setSavedFilterSets,
    filteredItemsCount,
  });

  return (
    <>
      {actionModal}
      <Table
        {...collectionProps}
        onSortingChange={(event) => {
          const { sortingColumn, isDescending } = event.detail;
          setQueryParam(
            SORT_QUERY_PARAM_KEY,
            sortingColumn.sortingField ? `${isDescending ? '-' : ''}${sortingColumn.sortingField}` : null,
          );
          collectionProps.onSortingChange?.(event);
        }}
        variant="full-page"
        stickyHeader
        resizableColumns
        header={
          <Header
            variant="awsui-h1-sticky"
            counter={`(${props.agents.length})`}
            actions={
              <SpaceBetween
                direction="horizontal"
                size="xs"
                alignItems="center"
              >
                <Button
                  variant="icon"
                  iconName="refresh"
                  ariaLabel="Refresh list"
                  onClick={props.onRetry}
                />
                {props.actions}
              </SpaceBetween>
            }
          >
            Agents
            {props.isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
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
        loadingText="Loading agents"
        empty={
          props.error ? (
            <LoadError
              error={props.error}
              onRetry={props.onRetry}
              resource="agents"
            />
          ) : (
            <Box
              variant="p"
              color="inherit"
            >
              No agents
            </Box>
          )
        }
        wrapLines={preferences.wrapLines}
        stripedRows={preferences.stripedRows}
        contentDensity={preferences.contentDensity}
        stickyColumns={preferences.stickyColumns}
        filter={
          <PropertyFilter
            {...propertyFilterProps}
            expandToViewport={true}
            countText={countText}
            customControl={customControl}
            customFilterActions={customFilterActions}
            onChange={(event) => {
              saveQueryFilter(event, setQueryParam);
              propertyFilterProps.onChange(event);
            }}
          />
        }
        pagination={
          <Pagination
            {...paginationProps}
            onChange={(event) => {
              setQueryParam(PAGE_QUERY_PARAM_KEY, String(event.detail.currentPageIndex));
              paginationProps.onChange(event);
            }}
          />
        }
        preferences={
          <DcAgentTablePreferences
            preferences={preferences}
            onConfirm={setPreferences}
          />
        }
      />
    </>
  );
}
