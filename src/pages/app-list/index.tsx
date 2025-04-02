import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useQuery } from '@tanstack/react-query';
import { StatusIndicator } from '@cloudscape-design/components';
import AppListTable from './components/app-list-table';
import { remoteAppList } from '@/remote/remote-app-list';

export default function AppList() {
  const { isPending, data, isSuccess, isFetching } = useQuery({
    queryKey: ['apps'],
    queryFn: () => remoteAppList(),
  });

  return (
    <SpaceBetween size="m">
      <Header variant="h1">app list
        {isFetching && !isPending && (
          <StatusIndicator type="loading">
            Fetching
          </StatusIndicator>
        )}
      </Header>

      <AppListTable apps={isSuccess ? data.apps : []} isLoading={isPending} />
    </SpaceBetween>
  );
}
