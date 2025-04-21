import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useQuery } from '@tanstack/react-query';
import { StatusIndicator } from '@cloudscape-design/components';
import { remoteServiceList } from '@/remote/remote-service-list';
import ServiceListTable from '@/components/service/service-list-table';

export default function ServiceList() {
  const { isPending, data, isSuccess, isFetching } = useQuery({
    queryKey: ['services'],
    queryFn: () => remoteServiceList(),
  });

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        Service List
        {isFetching && !isPending && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <ServiceListTable
        services={isSuccess ? data.services : []}
        isLoading={isPending}
      />
    </SpaceBetween>
  );
}
