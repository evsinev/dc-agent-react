import { Tabs } from '@cloudscape-design/components';
import AppView from '@/pages/app-view';
import ServiceViewPanel from '@/pages/service-view/components/service-view-panel';
import ServiceLogPanel from '@/pages/app-list/components/service-log-panel';

interface Props {
  appName?: string;
  serviceHost: string;
  serviceName: string;
}

export default function AppServicePanel(props: Props) {
  return (
    <Tabs
      tabs={[
        {
          label: 'App',
          id: 'app',
          content: (
            <AppView
              appName={props.appName}
              showAppInfo={false}
            />
          ),
        },
        {
          label: 'Service',
          id: 'service',
          content: (
            <ServiceViewPanel
              host={props.serviceHost}
              serviceName={props.serviceName}
            />
          ),
        },
        {
          label: 'Logs',
          id: 'logs',
          content: (
            <ServiceLogPanel
              host={props.serviceHost}
              serviceName={props.serviceName}
            />
          ),
        },
      ]}
    />
  );
}
