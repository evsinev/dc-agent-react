import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import { useCollection } from '@cloudscape-design/collection-hooks';
import AppDetail from './app-detail';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { AppListItem } from '@/remote/remote-app-list';

type AppListTableProps = {
  apps: AppListItem[],
  isLoading: boolean
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

export default function AppListTable(props: AppListTableProps) {
  const { items, collectionProps } = useCollection(props.apps, defaultSorting);
  const { show } = useSplitPanel();

  const itemCell = (item: AppListItem) => (
    <Link
      onClick={() => show({ content: <AppDetail appName={item.appName} />, title: item.appName })}
    >
      {item.appName}
    </Link>
  );

  return (
    <Table
      {...collectionProps}
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
    />
  );
}
