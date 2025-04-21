import { useCollection } from '@cloudscape-design/collection-hooks';
import { StatusIndicator } from '@cloudscape-design/components';
import Link from '@cloudscape-design/components/link';
import Table from '@cloudscape-design/components/table';
import { ServiceListItem } from '../api/service-list';

type Props = {
  services: ServiceListItem[];
  isLoading: boolean;
};

export default function ServiceListTable(props: Props) {
  const { items, collectionProps } = useCollection(props.services, {
    sorting: {},
  });

  const serviceNameLink = (item: ServiceListItem) => (
    <Link href={`/dc-operator/services/${item.fqsn}`}>{item.serviceName}</Link>
  );
  const statusNameLink = (item: ServiceListItem) => (
    <StatusIndicator type={item.statusIndicator}>{item.statusName}</StatusIndicator>
  );

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
    />
  );
}
