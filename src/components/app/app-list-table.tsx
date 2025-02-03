import * as React from 'react';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { AppListItem } from '@/remote/remote-app-list';

type AppListTableProps = {
  apps: AppListItem[],
  isLoading: boolean
};

function AppListTable(props: AppListTableProps) {
  console.log('apps', props.apps?.length > 0, props.apps);
  const { items, collectionProps } = useCollection(
    props.apps,
    {
      sorting: {},
    },
  );
  return (
    <Table
      {...collectionProps}
      columnDefinitions={[
        {
          id: 'appName',
          header: 'App',
          // eslint-disable-next-line
          cell: (item) => <Link href={`/dc-operator/apps/${item.appName}`}>{item.appName}</Link>,
          sortingField: 'appName',
          isRowHeader: true,
        },
        {
          id: 'taskHost',
          header: 'Host',
          // eslint-disable-next-line
          cell: item => item.taskHost,
          sortingField: 'taskHost',
        },
        {
          id: 'taskName',
          header: 'Task Name',
          // eslint-disable-next-line
          cell: item => item.taskName,
          sortingField: 'taskName',
        },
        {
          id: 'taskType',
          header: 'Task Type',
          // eslint-disable-next-line
          cell: item => item.taskType,
          sortingField: 'taskType',
        },
      ]}
      columnDisplay={[
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
      ]}
      items={items}
      loadingText="Loading resources"
      trackBy="appName"
      loading={props.isLoading}
    />
  );
}

export default AppListTable;
