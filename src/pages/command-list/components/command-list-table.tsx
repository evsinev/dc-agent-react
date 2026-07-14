import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  parsePropertyFilterQuery,
  PROPERTY_FILTERS_QUERY_PARAM_KEY,
  saveQueryFilter,
} from '@/libs/parse-property-filter';
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

const columnDefinitions: TableProps.ColumnDefinition<CommandInfo>[] = [
  { id: 'name', header: 'Command', cell: commandNameCell, sortingField: 'name', isRowHeader: true },
  {
    id: 'host',
    header: 'Host',
    cell: (c) => <Link to={routing.agent.replace(':name', c.host)}>{c.host}</Link>,
    sortingField: 'host',
  },
  { id: 'type', header: 'Type', cell: (c) => c.type ?? '—', sortingField: 'type' },
];

export default function CommandListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    COMMAND_PREFERENCES_STORAGE_KEY,
    DEFAULT_COMMAND_PREFERENCES,
  );

  const { items, collectionProps, propertyFilterProps, paginationProps } = useCollection(props.commands, {
    sorting: {},
    pagination: { pageSize: preferences.pageSize },
    propertyFiltering: {
      filteringProperties: COMMAND_FILTERING_PROPERTIES,
      defaultQuery: parsePropertyFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY)),
    },
  });

  return (
    <Table
      {...collectionProps}
      variant="full-page"
      stickyHeader
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
          onChange={(event) => {
            saveQueryFilter(event, setQueryParam);
            propertyFilterProps.onChange(event);
          }}
        />
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CommandTablePreferences
          preferences={preferences}
          onConfirm={setPreferences}
        />
      }
    />
  );
}
