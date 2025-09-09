import { useServiceView } from '@/pages/service-view/api/service-view';
import ServiceHeader from '@/pages/service-view/components/header';
import Status from '@/pages/service-view/components/status';
import { CodeView } from '@cloudscape-design/code-view';
// @ts-ignore Неверный импорт в типах библиотеки
import shHighlight from '@cloudscape-design/code-view/highlight/sh';
import { Button, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';

type Props = {
  host: string;
  serviceName: string;
}
export default function ServiceLogPanel({ host, serviceName }: Props) {
  const fqsn = `${host}/${serviceName}`;

  const { data, isLoading, mutate } = useServiceView({ fqsn });

  async function refreshLogs() {
    await mutate();
  }

  return (
    <Container header={
      <Header
        headingTagOverride="h5"
        actions={
          <Button
            onClick={refreshLogs}
            iconName="refresh"
            loadingText="Refreshing logs"
            loading={isLoading}
          />}
      >
        /var/log/{data?.service?.serviceName || ''}/current
      </Header>}>
      <CodeView
        lineNumbers
        content={data?.lastLogLines || 'Loading logs ...'}
      />
    </Container>
  );
}
