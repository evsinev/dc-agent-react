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
import { CommandInfo } from '@/pages/command-list/api/command-list';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Box,
  CollectionPreferencesProps,
  Pagination,
  PropertyFilter,
  StatusIndicator,
} from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import Table, { TableProps } from '@cloudscape-design/components/table';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import routing from '@routing';
import LoadError from '@/components/error/components/load-error';
import CommandTablePreferences, {
  COMMAND_PREFERENCES_STORAGE_KEY,
  DEFAULT_COMMAND_PREFERENCES,
} from './command-list-preferences';
import { COMMAND_FILTERING_PROPERTIES } from './command-list-table-filters';
import { commandNameCell } from './command-name-cell';
import { PARAM_COLUMNS, SERVICE_STATE_COLUMN, genericParamColumn } from './command-list-param-columns';

type Props = {
  commands: CommandInfo[];
  isLoading: boolean;
  selected: CommandInfo[];
  setSelected: (commands: CommandInfo[]) => void;
  actions?: ReactNode;
  error?: unknown;
  onRetry: () => void;
};

export const commandKey = (command: CommandInfo) => `${command.host}/${command.name ?? '(error)'}`;

// The service state is resolved server-side (CommandInfo.serviceStatus*), so the columns are static —
// no runtime join, no second request.
const columnDefinitions: TableProps.ColumnDefinition<CommandInfo>[] = [
  { id: 'name', header: 'Command', cell: commandNameCell, sortingField: 'name', isRowHeader: true },
  {
    id: 'host',
    header: 'Host',
    cell: (c) => <Link to={routing.agent.replace(':name', c.host)}>{c.host}</Link>,
    sortingField: 'host',
  },
  { id: 'type', header: 'Type', cell: (c) => c.type ?? '—', sortingField: 'type' },
  {
    id: SERVICE_STATE_COLUMN.id,
    header: SERVICE_STATE_COLUMN.label,
    cell: (c) =>
      c.serviceStatusIndicator ? (
        <StatusIndicator type={c.serviceStatusIndicator}>{c.serviceStatusName}</StatusIndicator>
      ) : (
        ''
      ),
    sortingComparator: (a, b) => (a.serviceStatusName ?? '').localeCompare(b.serviceStatusName ?? ''),
  },
  // One column per command config parameter (blank when the command lacks it);
  // serviceName is rendered as a link to its service.
  ...PARAM_COLUMNS.map((col) =>
    col.key === 'serviceName'
      ? {
          id: 'serviceName',
          header: col.label,
          cell: (c: CommandInfo) => {
            const svc = c.parameters?.serviceName;
            return svc ? <Link to={routing.service.replace(':host/:serviceName', `${c.host}/${svc}`)}>{svc}</Link> : '';
          },
          sortingComparator: (a: CommandInfo, b: CommandInfo) =>
            (a.parameters?.serviceName ?? '').localeCompare(b.parameters?.serviceName ?? ''),
        }
      : genericParamColumn(col),
  ),
];

export default function CommandListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();

  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    COMMAND_PREFERENCES_STORAGE_KEY,
    DEFAULT_COMMAND_PREFERENCES,
  );

  const [savedFilterSets, setSavedFilterSets] = useLocalStorage<FilterSet[]>('command-list-filter-sets', []);

  const defaultPage = Math.max(1, Number(getQueryParam(PAGE_QUERY_PARAM_KEY)) || 1);
  const sortParam = getQueryParam(SORT_QUERY_PARAM_KEY);
  const defaultSortingState = sortParam
    ? { sortingColumn: { sortingField: sortParam.replace(/^-/, '') }, isDescending: sortParam.startsWith('-') }
    : undefined;

  const { items, actions, collectionProps, propertyFilterProps, paginationProps, filteredItemsCount } = useCollection(
    props.commands,
    {
      sorting: { defaultState: defaultSortingState },
      pagination: { pageSize: preferences.pageSize, defaultPage },
      propertyFiltering: {
        filteringProperties: COMMAND_FILTERING_PROPERTIES,
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
            counter={`(${props.commands.length})`}
            actions={props.actions}
          >
            Commands
            {props.isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
          </Header>
        }
        selectionType="single"
        onSelectionChange={(e) => props.setSelected(e.detail.selectedItems)}
        selectedItems={props.selected}
        columnDefinitions={columnDefinitions}
        columnDisplay={preferences.contentDisplay}
        items={items}
        trackBy={commandKey}
        loading={props.isLoading}
        loadingText="Loading commands"
        empty={
          props.error ? (
            <LoadError
              error={props.error}
              onRetry={props.onRetry}
              resource="commands"
            />
          ) : (
            <Box
              variant="p"
              color="inherit"
            >
              No commands
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
          <CommandTablePreferences
            preferences={preferences}
            onConfirm={setPreferences}
          />
        }
      />
    </>
  );
}
