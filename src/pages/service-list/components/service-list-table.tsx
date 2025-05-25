import { useCollection } from '@cloudscape-design/collection-hooks';
import { PropertyFilter, StatusIndicator } from '@cloudscape-design/components';
import Table from '@cloudscape-design/components/table';
import routing from '@routing';
import { Link } from 'react-router';
import { ServiceListItem } from '../api/service-list';
import { SERVICE_LIST_FILTERING_PROPERTIES } from '@/pages/service-list/components/service-list-table-filters';
import { useQueryParams } from '@/hooks/use-query-params';
import { parsePropertyFilterQuery } from '@/libs/parse-property-filter';

const PROPERTY_FILTERS_QUERY_PARAM_KEY = 'propertyFilter';

type Props = {
  services: ServiceListItem[];
  isLoading: boolean;
  selected: ServiceListItem[];
  setSelected: (app: ServiceListItem[]) => void;
};

const serviceNameLink = (item: ServiceListItem) => (
  <Link to={routing.service.replace(':host/:serviceName', item.fqsn)}>{item.serviceName}</Link>
);

const statusNameLink = (item: ServiceListItem) => (
  <StatusIndicator type={item.statusIndicator}>{item.statusName}</StatusIndicator>
);

export default function ServiceListTable(props: Props) {
  const { getQueryParam, setQueryParam } = useQueryParams();
  const { items, collectionProps, propertyFilterProps } = useCollection(props.services, {
    sorting: {},
    propertyFiltering: {
      filteringProperties: SERVICE_LIST_FILTERING_PROPERTIES,
      defaultQuery: parsePropertyFilterQuery(getQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY)),
    },
  });

  return (
    <Table
      {...collectionProps}
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
      items={items}
      loadingText="Loading services ..."
      trackBy="fqsn"
      loading={props.isLoading}
      selectionType="single"
      onSelectionChange={(e) => props.setSelected(e.detail.selectedItems)}
      selectedItems={props.selected}
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          expandToViewport={true}
          onChange={event => {
            const query = event.detail;
            if (!query.tokens?.length) {
              setQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY, null);
            } else {
              setQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY, JSON.stringify(query));
            }

            propertyFilterProps.onChange(event);
          }}
        />
      }
    />
  );
}
