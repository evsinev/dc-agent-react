import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTableParams } from '@/hooks/use-table-params';
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
import InfoHelpLink from '@/components/info/info-help-link';
import CommandTablePreferences, { DEFAULT_COMMAND_PREFERENCES } from './command-list-preferences';
import { COMMAND_FILTERING_PROPERTIES } from './command-list-table-filters';
import { commandNameCell } from './command-name-cell';
import { PARAM_COLUMNS, SERVICE_STATE_COLUMN, genericParamColumn } from './command-list-param-columns';

const COMMAND_DESCRIPTION =
  'Deploy endpoints on an agent — each is a config file that exposes an api-key-guarded URL that CI pushes build artifacts to.';

const COMMAND_HELP = (
  <div>
    <p>
      A command is a config file in an agent's <code>config/</code> directory plus the HTTP endpoint that uses it (
      <code>/dc-agent/&lt;type&gt;/&lt;name&gt;</code>), guarded by an <code>api-key</code> header — each key mapped to
      an owner label; without keys the endpoint is open.
    </p>
    <p>
      CI pushes a build artifact to the endpoint. Deploy-type commands (jar/war/node) swap the artifact, restart the
      linked daemontools service, and optionally poll a health URL; others store, unzip, fetch, or apply a docker
      definition. Each command belongs to one agent; jar/war/node also target one service.
    </p>
  </div>
);

type Props = {
  commands: CommandInfo[];
  isLoading: boolean;
  isValidating?: boolean;
  selected?: CommandInfo[];
  setSelected?: (commands: CommandInfo[]) => void;
  actions?: ReactNode;
  error?: unknown;
  onRetry: () => void;
  // Embedding controls (defaults reproduce the standalone full-page Command List behavior).
  variant?: 'full-page' | 'embedded';
  urlState?: boolean;
  selectable?: boolean;
  storageKeyPrefix?: string;
  defaultPreferences?: CollectionPreferencesProps.Preferences;
  title?: string;
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
  const {
    variant = 'full-page',
    urlState = true,
    selectable = true,
    storageKeyPrefix = 'command-list',
    defaultPreferences = DEFAULT_COMMAND_PREFERENCES,
    title = 'Commands',
  } = props;

  const { getParam, setParam } = useTableParams(urlState);

  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    `${storageKeyPrefix}-preferences`,
    defaultPreferences,
  );

  const [savedFilterSets, setSavedFilterSets] = useLocalStorage<FilterSet[]>(`${storageKeyPrefix}-filter-sets`, []);

  const defaultPage = Math.max(1, Number(getParam(PAGE_QUERY_PARAM_KEY)) || 1);
  const sortParam = getParam(SORT_QUERY_PARAM_KEY);
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
        defaultQuery: resolveDefaultFilterQuery(getParam(PROPERTY_FILTERS_QUERY_PARAM_KEY), savedFilterSets),
      },
    },
  );

  const { customControl, customFilterActions, actionModal, countText } = useFilterSetControls({
    propertyFilterProps,
    actions,
    getQueryParam: getParam,
    setQueryParam: setParam,
    savedFilterSets,
    setSavedFilterSets,
    filteredItemsCount,
  });

  return (
    <>
      {actionModal}
      {props.error && items.length > 0 && (
        <LoadError
          error={props.error}
          onRetry={props.onRetry}
          resource="commands"
        />
      )}
      <Table
        {...collectionProps}
        onSortingChange={(event) => {
          const { sortingColumn, isDescending } = event.detail;
          setParam(
            SORT_QUERY_PARAM_KEY,
            sortingColumn.sortingField ? `${isDescending ? '-' : ''}${sortingColumn.sortingField}` : null,
          );
          collectionProps.onSortingChange?.(event);
        }}
        variant={variant}
        stickyHeader={variant === 'full-page'}
        resizableColumns
        header={
          <Header
            variant={variant === 'full-page' ? 'awsui-h1-sticky' : undefined}
            counter={`(${props.commands.length})`}
            description={COMMAND_DESCRIPTION}
            info={
              <InfoHelpLink
                title="Commands"
                content={COMMAND_HELP}
              />
            }
            actions={
              <SpaceBetween
                direction="horizontal"
                size="xs"
                alignItems="center"
              >
                {props.isValidating && <StatusIndicator type="loading">Fetching</StatusIndicator>}
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
            {title}
          </Header>
        }
        selectionType={selectable ? 'single' : undefined}
        onSelectionChange={selectable ? (e) => props.setSelected?.(e.detail.selectedItems) : undefined}
        selectedItems={selectable ? props.selected : undefined}
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
              saveQueryFilter(event, setParam);
              propertyFilterProps.onChange(event);
            }}
          />
        }
        pagination={
          <Pagination
            {...paginationProps}
            onChange={(event) => {
              setParam(PAGE_QUERY_PARAM_KEY, String(event.detail.currentPageIndex));
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
