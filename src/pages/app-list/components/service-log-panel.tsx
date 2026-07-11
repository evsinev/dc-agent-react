import { useServiceView } from '@/pages/service-view/api/service-view';
import { CodeView } from '@cloudscape-design/code-view';
import { Button, Container, Header } from '@cloudscape-design/components';

type Props = {
  host: string;
  serviceName: string;
};
export default function ServiceLogPanel({ host, serviceName }: Props) {
  const fqsn = `${host}/${serviceName}`;

  const { data, isLoading, mutate } = useServiceView({ fqsn });

  async function refreshLogs() {
    await mutate();
  }

  return (
    <Container
      header={
        <Header
          headingTagOverride="h5"
          actions={
            <Button
              onClick={refreshLogs}
              iconName="refresh"
              loadingText="Refreshing logs"
              loading={isLoading}
            />
          }
        >
          /var/log/{data?.service?.serviceName || ''}/current
        </Header>
      }
    >
      <CodeView
        lineNumbers
        content={data?.lastLogLines || 'Loading logs ...'}
      />
    </Container>
  );
}
