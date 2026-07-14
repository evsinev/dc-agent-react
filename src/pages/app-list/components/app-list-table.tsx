import { AppListItem } from '@/pages/app-list/api/app-list';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Table from '@cloudscape-design/components/table';
import routing from '@routing';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import { APP_LIST_FILTERING_PROPERTIES } from '@/pages/app-list/components/app-list-table-filters';
import {
  Box,
  CollectionPreferencesProps,
  Pagination,
  PropertyFilter,
  StatusIndicator,
} from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import { parsePropertyFilterQuery, saveQueryFilter } from '@/libs/parse-property-filter';
import LoadError from '@/components/error/components/load-error';
import { AppStatusIndicator } from '@/pages/app-list/components/app-status-indicator';
import AppTablePreferences, { APP_PREFERENCES_STORAGE_KEY, DEFAULT_APP_PREFERENCES } from './app-list-preferences';

const PROPERTY_FILTERS_QUERY_PARAM_KEY = 'propertyFilter';

type AppListTableProps = {
  apps: AppListItem[];
  selected: AppListItem[];
  setSelected: (app: AppListItem[]) => void;
  isLoading: boolean;
  actions?: ReactNode;
  error?: unknown;
  onRetry: () => void;
};

const defaultSorting = { sorting: {} };

const itemCell = (item: AppListItem) => <Link to={routing.app.replace(':appName', item.appName)}>{item.appName}</Link>;

export default function AppListTable(props: AppListTableProps) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    APP_PREFERENCES_STORAGE_KEY,
    DEFAULT_APP_PREFERENCES,
  );

  const { items, collectionProps, propertyFilterProps, paginationProps } = useCollection(props.apps, {
    sorting: defaultSorting.sorting,
    pagination: { pageSize: preferences.pageSize },
    propertyFiltering: {
      filteringProperties: APP_LIST_FILTERING_PROPERTIES,
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
          counter={`(${props.apps.length})`}
          actions={props.actions}
        >
          Applications
          {props.isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
        </Header>
      }
      selectionType="single"
      onSelectionChange={(e) => props.setSelected(e.detail.selectedItems)}
      selectedItems={props.selected}
      columnDefinitions={[
        {
          id: 'appName',
          header: 'App',
          cell: itemCell,
          sortingField: 'appName',
          isRowHeader: true,
        },
        {
          id: 'appStatus',
          header: 'Status',
          cell: (it) => <AppStatusIndicator appName={it.appName} />,
          sortingField: 'appName',
          isRowHeader: true,
        },
        {
          id: 'taskHost',
          header: 'Host',
          cell: (item) => item.taskHost,
          sortingField: 'taskHost',
        },
        {
          id: 'taskName',
          header: 'Task Name',
          cell: (item) => item.taskName,
          sortingField: 'taskName',
        },
        {
          id: 'taskType',
          header: 'Task Type',
          cell: (item) => item.taskType,
          sortingField: 'taskType',
        },
      ]}
      columnDisplay={preferences.contentDisplay}
      wrapLines={preferences.wrapLines}
      stripedRows={preferences.stripedRows}
      contentDensity={preferences.contentDensity}
      stickyColumns={preferences.stickyColumns}
      items={items}
      loadingText="Loading resources"
      trackBy="appName"
      loading={props.isLoading}
      empty={
        props.error ? (
          <LoadError
            error={props.error}
            onRetry={props.onRetry}
            resource="applications"
          />
        ) : (
          <Box
            variant="p"
            color="inherit"
          >
            No applications
          </Box>
        )
      }
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
        <AppTablePreferences
          preferences={preferences}
          onConfirm={setPreferences}
        />
      }
    />
  );
}
