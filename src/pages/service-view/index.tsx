import { useServiceView } from '@/pages/service-view/api';
import ServiceHeader from '@/pages/service-view/components/header';
import Status from '@/pages/service-view/components/status';
import { CodeView } from '@cloudscape-design/code-view';
// @ts-ignore Неверный импорт в типах библиотеки
import shHighlight from '@cloudscape-design/code-view/highlight/sh';
import { Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import { useParams } from 'react-router';

export default function ServiceView() {
  const { host, serviceName } = useParams();
  const fqsn = `${host}/${serviceName}`;

  const { data, isLoading, mutate } = useServiceView({ fqsn });

  return (
    <SpaceBetween size="m">
      <ServiceHeader
        service={data}
        isLoading={isLoading}
        fqsn={fqsn}
        refetch={mutate}
      />

      {isLoading && <StatusIndicator type="loading">Pending ...</StatusIndicator>}

      {data && (
        <SpaceBetween size="l">
          <Status {...data} />
          <Container header={<Header headingTagOverride="h3">/service/{data.service.serviceName}/run</Header>}>
            <CodeView
              highlight={shHighlight}
              lineNumbers
              content={data.runContent}
            />
          </Container>

          <Container header={<Header headingTagOverride="h3">/service/{data.service.serviceName}/log/run</Header>}>
            <CodeView
              highlight={shHighlight}
              lineNumbers
              content={data.logRunContent}
            />
          </Container>

          <Container header={<Header headingTagOverride="h3">/var/log/{data.service.serviceName}/current</Header>}>
            <CodeView
              lineNumbers
              content={data.lastLogLines}
            />
          </Container>
        </SpaceBetween>
      )}
    </SpaceBetween>
  );
}
