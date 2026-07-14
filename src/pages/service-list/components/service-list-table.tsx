import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Box,
  Button,
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
import { useTableParams } from '@/hooks/use-table-params';
import {
  PAGE_QUERY_PARAM_KEY,
  PROPERTY_FILTERS_QUERY_PARAM_KEY,
  saveQueryFilter,
  SORT_QUERY_PARAM_KEY,
} from '@/libs/parse-property-filter';
import LoadError from '@/components/error/components/load-error';
import InfoHelpLink from '@/components/info/info-help-link';
import ServiceTablePreferences, { DEFAULT_SERVICE_PREFERENCES } from './service-list-preferences';
import {
  resolveDefaultFilterQuery,
  useFilterSetControls,
} from '@/components/table-filter-sets/use-filter-set-controls';
import { FilterSet } from '@/components/table-filter-sets/use-filter-sets';

const SERVICE_DESCRIPTION =
  "daemontools-supervised processes on an agent host; the State column is read live from daemontools' supervise status.";

const SERVICE_HELP = (
  <div>
    <p>
      A service is a long-running process supervised by daemontools on an agent host — one directory under
      <code> /service</code>. The operator lists and controls it over the control-plane channel (up, down, hangup,
      terminate).
    </p>
    <p>
      The State column shows the raw supervise state — UP, DOWN, UP_PAUSED, UP_WANT_DOWN, DOWN_NORMALLY_UP,
      DOWN_WANT_UP, UP_NORMALLY_DOWN, or ERROR — alongside PID and uptime. Deploy commands (jar/war/node) restart the
      service named in their <code>serviceName</code>.
    </p>
  </div>
);

type Props = {
  services: ServiceListItem[];
  isLoading: boolean;
  selected?: ServiceListItem[];
  setSelected?: (app: ServiceListItem[]) => void;
  error?: unknown;
  onRetry: () => void;
  // Embedding controls (defaults reproduce the standalone full-page Service List behavior).
  variant?: 'full-page' | 'embedded';
  urlState?: boolean;
  selectable?: boolean;
  storageKeyPrefix?: string;
  defaultPreferences?: CollectionPreferencesProps.Preferences;
  title?: string;
};

const serviceNameLink = (item: ServiceListItem) => (
  <Link to={routing.service.replace(':host/:serviceName', item.fqsn)}>{item.serviceName}</Link>
);

const statusNameLink = (item: ServiceListItem) => (
  <StatusIndicator type={item.statusIndicator}>{item.statusName}</StatusIndicator>
);

export default function ServiceListTable(props: Props) {
  const {
    variant = 'full-page',
    urlState = true,
    selectable = true,
    storageKeyPrefix = 'service-list',
    defaultPreferences = DEFAULT_SERVICE_PREFERENCES,
    title = 'Services',
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
    props.services,
    {
      sorting: { defaultState: defaultSortingState },
      pagination: { pageSize: preferences.pageSize, defaultPage },
      propertyFiltering: {
        filteringProperties: SERVICE_LIST_FILTERING_PROPERTIES,
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
            counter={`(${props.services.length})`}
            description={SERVICE_DESCRIPTION}
            info={
              <InfoHelpLink
                title="Services"
                content={SERVICE_HELP}
              />
            }
            actions={
              <Button
                variant="icon"
                iconName="refresh"
                ariaLabel="Refresh list"
                onClick={props.onRetry}
              />
            }
          >
            {title}
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
        selectionType={selectable ? 'single' : undefined}
        onSelectionChange={selectable ? (e) => props.setSelected?.(e.detail.selectedItems) : undefined}
        selectedItems={selectable ? props.selected : undefined}
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
          <ServiceTablePreferences
            preferences={preferences}
            onConfirm={setPreferences}
          />
        }
      />
    </>
  );
}
