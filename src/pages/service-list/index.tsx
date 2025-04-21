import { useServiceList } from '@/pages/service-list/api';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ServiceListTable from './components/service-list-table';

export default function ServiceList() {
  const { data, isLoading } = useServiceList();
  const services = data?.services ?? [];

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        Service List
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <ServiceListTable
        services={services}
        isLoading={isLoading}
      />
    </SpaceBetween>
  );
}
