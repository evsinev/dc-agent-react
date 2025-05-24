import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { ServiceListItem, useServiceList } from './api/service-list';
import ServiceListTable from './components/service-list-table';
import { useEffect, useState } from 'react';
import { useSplitPanel } from '@/hooks/use-split-panel';
import ServiceViewPanel from '@/pages/service-view/components/service-view-panel';

export default function ServiceList() {
  const { data, isLoading } = useServiceList();
  const services = data?.services ?? [];
  const [selectedService, setSelectedServices] = useState<ServiceListItem[]>([]);

  const showSplit = useSplitPanel((state) => state.show);
  const hideSplit = useSplitPanel((state) => state.hide);

  useEffect(() => {
    if (selectedService.length > 0) {
      const service = selectedService[0];
      showSplit({
          content: <ServiceViewPanel serviceName={service.serviceName} host={service.host} />,
          title: `${service.host} / ${service.serviceName}`,
      });
    } else {
      hideSplit();
    }
  }, [selectedService]);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        Service List
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <ServiceListTable
        services={services}
        isLoading={isLoading}
        selected={selectedService}
        setSelected={setSelectedServices}
      />
    </SpaceBetween>
  );
}
