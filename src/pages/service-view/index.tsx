import { useParams } from 'react-router';
import ServiceViewPanel from '@/pages/service-view/components/service-view-panel';

export default function ServiceViewPage() {
  const { host, serviceName } = useParams();

  return (
    <ServiceViewPanel host={host ?? 'unknown-host'} serviceName={serviceName ?? 'unknown-service'} />
  );
}
