import { useDocumentTitle } from '@/hooks/use-document-title';
import ServiceViewPanel from '@/pages/service-view/components/service-view-panel';
import { useParams } from 'react-router';

export default function ServiceViewPage() {
  const { host, serviceName } = useParams();

  useDocumentTitle(`${host ?? 'unknown-host'} / ${serviceName ?? 'unknown-service'}`);

  return (
    <ServiceViewPanel
      host={host ?? 'unknown-host'}
      serviceName={serviceName ?? 'unknown-service'}
    />
  );
}
