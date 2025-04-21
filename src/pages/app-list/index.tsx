import { useAppList } from '@/pages/app-list/api/app-list';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import AppListTable from './components/app-list-table';

export default function AppList() {
  const { data, isLoading } = useAppList();

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        app list
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <AppListTable
        apps={data?.apps ?? []}
        isLoading={isLoading}
      />
    </SpaceBetween>
  );
}
