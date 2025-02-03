import * as React from 'react';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { ServiceListItem, ServiceStateType } from '@/remote/remote-service-list';
import { StatusIndicator } from '@cloudscape-design/components';
import { StatusIndicatorProps } from '@cloudscape-design/components/status-indicator/internal';

type ServiceListTableProps = {
  services: ServiceListItem[],
  isLoading: boolean
};

// 'error' | 'warning' | 'success' | 'info' | 'stopped' | 'pending' | 'in-progress' | 'loading'
function getIndicatorType(state: ServiceStateType) : StatusIndicatorProps.Type {
  switch (state) {
    case 'UP': return 'success';
    case 'DOWN': return 'stopped';
    case 'UP_NORMALLY_DOWN': return 'success';
    case 'DOWN_NORMALLY_UP': return 'stopped';
    case 'DOWN_WANT_UP': return 'warning';
    case 'UP_WANT_DOWN': return 'warning';
    case 'UP_PAUSED': return 'pending';
    default:
      return 'error';
  }
}

function createStateLabel<T>(item: T) {
  const state = item.serviceStatus?.state || 'ERROR';
  const indicatorType = getIndicatorType(state);
  return <StatusIndicator type={indicatorType}>{state}</StatusIndicator>;
}

function ServiceListTable(props: ServiceListTableProps) {
  console.log('got services', props.services?.length > 0, props.services);
  const { items, collectionProps } = useCollection(
    props.services,
    {
      sorting: {},
    },
  );
  return (
    <Table
      {...collectionProps}
      columnDefinitions={[
        {
          id: 'serviceName',
          header: 'Service',
          // eslint-disable-next-line
          cell: (item) => <Link href={`/dc-operator/services/${item.fqsn}`}>{item.serviceName}</Link>,
          sortingField: 'serviceName',
        },
        {
          id: 'host',
          header: 'Host',
          // eslint-disable-next-line
          cell: item => item.host,
          sortingField: 'host',
        },
        {
          id: 'statusName',
          header: 'State',
          // eslint-disable-next-line
          cell: item => <StatusIndicator type={item.statusIndicator}>{item.statusName}</StatusIndicator>,
          sortingField: 'statusName',
        },
        {
          id: 'ageFormatted',
          header: 'Age',
          // eslint-disable-next-line
          cell: item => item.ageFormatted,
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

export default ServiceListTable;
