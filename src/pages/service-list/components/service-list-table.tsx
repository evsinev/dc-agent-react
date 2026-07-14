import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Box,
  CollectionPreferencesProps,
  Pagination,
  PropertyFilter,
  StatusIndicator,
} from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import routing from '@routing';
import { Link } from 'react-router';
import { ServiceListItem } from '../api/service-list';
import { SERVICE_LIST_FILTERING_PROPERTIES } from '@/pages/service-list/components/service-list-table-filters';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  PAGE_QUERY_PARAM_KEY,
  parsePropertyFilterQuery,
  PROPERTY_FILTERS_QUERY_PARAM_KEY,
  saveQueryFilter,
  SORT_QUERY_PARAM_KEY,
} from '@/libs/parse-property-filter';
import LoadError from '@/components/error/components/load-error';
import ServiceTablePreferences, {
  DEFAULT_SERVICE_PREFERENCES,
  SERVICE_PREFERENCES_STORAGE_KEY,
} from './service-list-preferences';

type Props = {
  services: ServiceListItem[];
  isLoading: boolean;
  selected: ServiceListItem[];
  setSelected: (app: ServiceListItem[]) => void;
  error?: unknown;
  onRetry: () => void;
};

const serviceNameLink = (item: ServiceListItem) => (
  <Link to={routing.service.replace(':host/:serviceName', item.fqsn)}>{item.serviceName}</Link>
);

const statusNameLink = (item: ServiceListItem) => (
  <StatusIndicator type={item.statusIndicator}>{item.statusName}</StatusIndicator>
);

export default function ServiceListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
    SERVICE_PREFERENCES_STORAGE_KEY,
    DEFAULT_SERVICE_PREFERENCES,
  );

  const defaultPage = Math.max(1, Number(getQueryParam(PAGE_QUERY_PARAM_KEY)) || 1);
  const sortParam = getQueryParam(SORT_QUERY_PARAM_KEY);
  const defaultSortingState = sortParam
    ? { sortingColumn: { sortingField: sortParam.replace(/^-/, '') }, isDescending: sortParam.startsWith('-') }
    : undefined;

  const { items, collectionProps, propertyFilterProps, paginationProps } = useCollection(props.services, {
    sorting: { defaultState: defaultSortingState },
    pagination: { pageSize: preferences.pageSize, defaultPage },
    propertyFiltering: {
      filteringProperties: SERVICE_LIST_FILTERING_PROPERTIES,
      defaultQuery: parsePropertyFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY)),
    },
  });

  return (
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
      header={
        <Header
          variant="awsui-h1-sticky"
          counter={`(${props.services.length})`}
        >
          Services
          {props.isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
        </Header>
      }
      columnDefinitions={[
        {
          id: 'serviceName',
          header: 'Service',
          cell: serviceNameLink,
          sortingField: 'serviceName',
        },
        {
          id: 'host',
          header: 'Host',
          cell: (item) => item.host,
          sortingField: 'host',
        },
        {
          id: 'statusName',
          header: 'State',
          cell: statusNameLink,
          sortingField: 'statusName',
        },
        {
          id: 'ageFormatted',
          header: 'Age',
          cell: (item) => item.ageFormatted,
          sortingField: 'whenFormatted',
        },
      ]}
      columnDisplay={preferences.contentDisplay}
      wrapLines={preferences.wrapLines}
      stripedRows={preferences.stripedRows}
      contentDensity={preferences.contentDensity}
      stickyColumns={preferences.stickyColumns}
      items={items}
      loadingText="Loading services ..."
      trackBy="fqsn"
      loading={props.isLoading}
      empty={
        props.error ? (
          <LoadError
            error={props.error}
            onRetry={props.onRetry}
            resource="services"
          />
        ) : (
          <Box
            variant="p"
            color="inherit"
          >
            No services
          </Box>
        )
      }
      selectionType="single"
      onSelectionChange={(e) => props.setSelected(e.detail.selectedItems)}
      selectedItems={props.selected}
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
        <ServiceTablePreferences
          preferences={preferences}
          onConfirm={setPreferences}
        />
      }
    />
  );
}
