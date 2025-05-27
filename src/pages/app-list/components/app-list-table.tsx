import { AppListItem } from '@/pages/app-list/api/app-list';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Table from '@cloudscape-design/components/table';
import routing from '@routing';
import { Link } from 'react-router';
import { APP_LIST_FILTERING_PROPERTIES } from '@/pages/app-list/components/app-list-table-filters';
import { PropertyFilter } from '@cloudscape-design/components';
import { useQueryParams } from '@/hooks/use-query-params';
import { parsePropertyFilterQuery, saveQueryFilter } from '@/libs/parse-property-filter';

const PROPERTY_FILTERS_QUERY_PARAM_KEY = 'propertyFilter';

type AppListTableProps = {
  apps: AppListItem[];
  selected: AppListItem[];
  setSelected: (app: AppListItem[]) => void;
  isLoading: boolean;
};

const defaultSorting = { sorting: {} };

const columns = [
  {
    id: 'appName',
    visible: true,
  },
  {
    id: 'taskHost',
    visible: true,
  },
  {
    id: 'taskName',
    visible: true,
  },
  {
    id: 'taskType',
    visible: true,
  },
];

const itemCell = (item: AppListItem) => <Link to={routing.app.replace(':appName', item.appName)}>{item.appName}</Link>;

export default function AppListTable(props: AppListTableProps) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const { items, collectionProps, propertyFilterProps } = useCollection(props.apps,
    {
      sorting: defaultSorting.sorting,
      propertyFiltering: {
        filteringProperties: APP_LIST_FILTERING_PROPERTIES,
        defaultQuery: parsePropertyFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY)),
      },
    });

  return (
    <Table
      {...collectionProps}
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
      columnDisplay={columns}
      items={items}
      loadingText="Loading resources"
      trackBy="appName"
      loading={props.isLoading}
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          expandToViewport={true}
          onChange={event => {
            saveQueryFilter(event, setQueryParam);
            propertyFilterProps.onChange(event);
          }}
        />
      }
    />
  );
}
